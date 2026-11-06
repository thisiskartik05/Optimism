precision highp float;

// Uniforms
uniform float uConcentration;   // Sugar solution concentration c (0.0 to 1.0)
uniform float uTheta0;          // Initial polarization angle at z=0 (radians)
uniform float uFilter2Angle;    // Exit polarization filter angle (radians)
uniform float uTime;            // Elapsed time
uniform bool  uSpectrumMode;    // Toggle: continuous spectrum vs discrete RGB
uniform vec3  uCameraPos;       // Camera position in world space
uniform float uCylinderRadius;  // Cylinder radius (e.g. 0.5)
uniform float uCylinderHeight;  // Cylinder length along Z-axis (e.g. 4.0)

// Varyings from vertex shader
varying vec3 vLocalPos;
varying vec3 vCamPosLocal;

// Physical Constants
#define PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692

// Discrete RGB wavelengths in nanometers (Cauchy formula input)
#define LAMBDA_R 650.0
#define LAMBDA_G 532.0
#define LAMBDA_B 450.0

// Cauchy specific rotation constant: A / lambda^2 (A scaled for lambda in nm)
#define CAUCHY_A 2100000.0

// ---------------------------------------------------------------------------
// Approximate Wavelength (380 - 700 nm) to Linear RGB
// ---------------------------------------------------------------------------
vec3 wavelengthToRGB(float wl) {
    vec3 c = vec3(0.0);
    if (wl >= 380.0 && wl < 440.0) {
        c.r = (440.0 - wl) / 60.0;
        c.b = 1.0;
    } else if (wl >= 440.0 && wl < 490.0) {
        c.g = (wl - 440.0) / 50.0;
        c.b = 1.0;
    } else if (wl >= 490.0 && wl < 580.0) {
        c.r = (wl - 490.0) / 90.0;
        c.g = 1.0;
    } else if (wl >= 580.0 && wl < 620.0) {
        c.r = 1.0;
        c.g = (620.0 - wl) / 40.0;
    } else if (wl >= 620.0 && wl <= 700.0) {
        c.r = 1.0;
    }

    // Intensity falloff at spectral limits of human eye
    float factor = 1.0;
    if (wl < 420.0) {
        factor = 0.3 + 0.7 * (wl - 380.0) / 40.0;
    } else if (wl > 680.0) {
        factor = 0.3 + 0.7 * (700.0 - wl) / 20.0;
    }
    return clamp(c * factor, 0.0, 1.0);
}

// ---------------------------------------------------------------------------
// Main Volumetric Raymarcher
// ---------------------------------------------------------------------------
void main() {
    // Ray setup in local space
    vec3 ro = vCamPosLocal;
    vec3 rd = normalize(vLocalPos - vCamPosLocal);

    // 1. Analytical Ray - Cylinder Intersection (cylinder axis = Z)
    float R = uCylinderRadius;
    float halfH = uCylinderHeight * 0.5;
    float zMin = -halfH;
    float zMax =  halfH;

    // Cross-section in XY plane: x^2 + y^2 = R^2
    float a = dot(rd.xy, rd.xy);
    float b = dot(ro.xy, rd.xy);
    float c = dot(ro.xy, ro.xy) - R * R;

    // Ray parallel to cylinder axis
    if (a < 1e-6) {
        if (c > 0.0) discard;
    }

    float disc = b * b - a * c;
    if (disc < 0.0) {
        discard; // Ray misses cylinder volume
    }

    float sqrtDisc = sqrt(disc);
    float tCyl1 = (-b - sqrtDisc) / a;
    float tCyl2 = (-b + sqrtDisc) / a;

    // Clip with Z end caps
    float tEnter = tCyl1;
    float tExit  = tCyl2;

    if (abs(rd.z) > 1e-6) {
        float tz1 = (zMin - ro.z) / rd.z;
        float tz2 = (zMax - ro.z) / rd.z;
        float tzNear = min(tz1, tz2);
        float tzFar  = max(tz1, tz2);
        tEnter = max(tEnter, tzNear);
        tExit  = min(tExit, tzFar);
    } else {
        if (ro.z < zMin || ro.z > zMax) discard;
    }

    // Check valid interval
    if (tExit <= tEnter || tExit < 0.0) {
        discard;
    }

    // If camera is inside cylinder, start at camera position
    tEnter = max(tEnter, 0.0);

    // 2. Numerical Integration along Ray through Cylinder Volume
    const int NUM_STEPS = 64;
    float stepSize = (tExit - tEnter) / float(NUM_STEPS);
    vec3 accumulatedLight = vec3(0.0);

    // Vector pointing to camera in local space
    vec3 toCamera = -rd;

    for (int i = 0; i < NUM_STEPS; i++) {
        float t = tEnter + (float(i) + 0.5) * stepSize;
        vec3 p = ro + rd * t;

        // Depth along the tube: z = 0 at the light entrance (zMin) to uCylinderHeight at exit (zMax)
        float z = p.z - zMin;

        if (!uSpectrumMode) {
            // --- Discrete RGB Mode ---
            // 3D Polarization Helix for each wavelength: theta(z, lambda) = theta0 + c * z * (A / lambda^2)
            float thetaR = uTheta0 + uConcentration * z * (CAUCHY_A / (LAMBDA_R * LAMBDA_R));
            float thetaG = uTheta0 + uConcentration * z * (CAUCHY_A / (LAMBDA_G * LAMBDA_G));
            float thetaB = uTheta0 + uConcentration * z * (CAUCHY_A / (LAMBDA_B * LAMBDA_B));

            // Polarization vectors in the XY plane (perpendicular to Z-axis light propagation)
            vec3 P_R = vec3(cos(thetaR), sin(thetaR), 0.0);
            vec3 P_G = vec3(cos(thetaG), sin(thetaG), 0.0);
            vec3 P_B = vec3(cos(thetaB), sin(thetaB), 0.0);

            // Rayleigh Scattering: intensity proportional to dot product with camera vector squared
            float dotR = dot(P_R, toCamera);
            float dotG = dot(P_G, toCamera);
            float dotB = dot(P_B, toCamera);

            float scattR = dotR * dotR;
            float scattG = dotG * dotG;
            float scattB = dotB * dotB;

            // Optional Exit Polarizer (Malus's Law)
            if (abs(uFilter2Angle) > 0.0001) {
                float malusR = cos(thetaR - uFilter2Angle);
                float malusG = cos(thetaG - uFilter2Angle);
                float malusB = cos(thetaB - uFilter2Angle);
                scattR *= malusR * malusR;
                scattG *= malusG * malusG;
                scattB *= malusB * malusB;
            }

            accumulatedLight += vec3(scattR, scattG, scattB) * stepSize;

        } else {
            // --- Continuous Spectrum Mode ---
            const int N_SPEC = 7;
            vec3 spectralStep = vec3(0.0);

            for (int s = 0; s < N_SPEC; s++) {
                float wl = 400.0 + float(s) * 50.0;
                float theta = uTheta0 + uConcentration * z * (CAUCHY_A / (wl * wl));
                vec3 P = vec3(cos(theta), sin(theta), 0.0);

                float d = dot(P, toCamera);
                float scatt = d * d;

                if (abs(uFilter2Angle) > 0.0001) {
                    float malus = cos(theta - uFilter2Angle);
                    scatt *= malus * malus;
                }

                spectralStep += wavelengthToRGB(wl) * scatt;
            }

            accumulatedLight += (spectralStep / float(N_SPEC)) * stepSize;
        }
    }

    // 3. Glass Boundary Fresnel Highlight
    vec3 pEnter = ro + rd * tEnter;
    vec3 normal = normalize(vec3(pEnter.xy, 0.0));
    float NdotV = max(0.0, dot(normal, -rd));
    float fresnel = pow(1.0 - NdotV, 3.0);
    vec3 glassHighlight = vec3(0.9, 0.95, 1.0) * fresnel * 0.12;

    // 4. Tone Mapping, Contrast Boost, and Gamma Correction
    vec3 finalColor = accumulatedLight * 1.6 + glassHighlight;
    finalColor = clamp(finalColor, 0.0, 1.0);
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, 1.0);
}
