precision highp float;

// --- Uniforms ---
uniform float uConcentration;   // 0.0 to 1.0
uniform float uTheta0;          // initial polarization angle (radians)
uniform float uFilter2Angle;    // exit polarizer angle (radians)
uniform float uTime;            // animation time
uniform bool  uSpectrumMode;    // true = continuous spectrum, false = RGB bands
uniform vec3  uCameraPos;       // camera world position
uniform float uCylinderRadius;  // cylinder radius
uniform float uCylinderHeight;  // cylinder height

// --- Varyings ---
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec3 vViewDir;
varying vec3 vNormal;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
#define PI      3.14159265358979323846
#define TWO_PI  6.28318530717958647692
#define DEG2RAD 0.01745329251994329577

// Cauchy coefficient A  (deg · nm²)
#define CAUCHY_A 21000.0

// RGB representative wavelengths (nm)
#define LAMBDA_R 650.0
#define LAMBDA_G 532.0
#define LAMBDA_B 450.0

// ---------------------------------------------------------------------------
// Optical rotation angle for a given wavelength, concentration and depth z
//   alpha(lambda) = CAUCHY_A / lambda^2        [deg]
//   theta(z,lam)  = uTheta0 + alpha * C * z   [rad]
// z is in scene units; we treat 1 unit ≈ 1 cm for a typical sugar solution.
// ---------------------------------------------------------------------------
float rotationAngle(float lambda_nm, float z) {
    float alpha = CAUCHY_A / (lambda_nm * lambda_nm); // deg / (cm · g/mL)
    // convert to radians, multiply by concentration and path length z
    return uTheta0 + alpha * DEG2RAD * uConcentration * z;
}

// ---------------------------------------------------------------------------
// Wavelength (nm, 380–700) → approximate linear-sRGB colour
// Uses a smooth piecewise model.
// ---------------------------------------------------------------------------
vec3 wavelengthToRGB(float wl) {
    vec3 c = vec3(0.0);

    // Red
    if (wl >= 620.0 && wl <= 700.0) {
        c.r = 1.0;
        c.g = 0.0;
        c.b = 0.0;
    } else if (wl >= 580.0 && wl < 620.0) {
        float t = (wl - 580.0) / 40.0;
        c.r = 1.0;
        c.g = 1.0 - t;
        c.b = 0.0;
    } else if (wl >= 490.0 && wl < 580.0) {
        float t = (wl - 490.0) / 90.0;
        c.r = t;
        c.g = 1.0;
        c.b = 0.0;
    } else if (wl >= 440.0 && wl < 490.0) {
        float t = (wl - 440.0) / 50.0;
        c.r = 0.0;
        c.g = t;
        c.b = 1.0;
    } else if (wl >= 380.0 && wl < 440.0) {
        float t = (wl - 380.0) / 60.0;
        c.r = 1.0 - t;
        c.g = 0.0;
        c.b = 1.0;
    }

    // Intensity fall-off at the spectral edges
    float factor = 1.0;
    if (wl >= 380.0 && wl < 420.0) {
        factor = 0.3 + 0.7 * (wl - 380.0) / 40.0;
    } else if (wl > 680.0 && wl <= 700.0) {
        factor = 0.3 + 0.7 * (700.0 - wl) / 20.0;
    }

    return clamp(c * factor, 0.0, 1.0);
}

// ---------------------------------------------------------------------------
// Blinn-Phong specular for the glass tube rim highlight
// ---------------------------------------------------------------------------
float glassSpecular(vec3 normal, vec3 viewDir, vec3 lightDir, float shininess) {
    vec3 halfVec = normalize(-viewDir + lightDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), shininess);
    return spec;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
void main() {

    // -----------------------------------------------------------------------
    // 1. Geometry — depth along cylinder axis and azimuthal angle
    // -----------------------------------------------------------------------

    // z: position along cylinder axis in scene units (0 … uCylinderHeight)
    float z = vUv.y * uCylinderHeight;

    // phi: azimuthal angle of this surface fragment (0 … 2π)
    float phi = vUv.x * TWO_PI;

    // Outward surface normal in the XY plane (local space)
    vec3 surfaceNormalLocal = vec3(cos(phi), sin(phi), 0.0);

    // -----------------------------------------------------------------------
    // 2. Camera / viewing angle in the XY plane
    // -----------------------------------------------------------------------

    // Direction from surface point to camera, projected onto XY plane (world→local approx)
    // We use vWorldPos and uCameraPos; for a cylinder aligned with Z the XY plane is relevant.
    vec3 toCamera = normalize(uCameraPos - vWorldPos);
    vec2 toCameraXY = normalize(toCamera.xy + vec2(1e-8)); // avoid degenerate

    // Surface normal XY
    vec2 normalXY = normalize(surfaceNormalLocal.xy);

    // phi_view: signed angle between surface normal and camera direction in XY plane
    float phi_view = atan(
        toCameraXY.y * normalXY.x - toCameraXY.x * normalXY.y,
        toCameraXY.x * normalXY.x + toCameraXY.y * normalXY.y
    );

    // -----------------------------------------------------------------------
    // 3. Normal and view direction for lighting / rim
    // -----------------------------------------------------------------------
    vec3 N = normalize(vNormal);              // view-space normal
    vec3 V = normalize(vViewDir);             // local-space view dir (toward camera when negated)
    float NdotV = dot(N, -V);                 // cos angle between normal and view ray

    // Rim darkening: fragments nearly tangent to view get darkened
    float rimFactor = abs(NdotV);
    float rimDarken = smoothstep(0.0, 0.5, rimFactor);

    // -----------------------------------------------------------------------
    // 4. Light direction (fixed, in view space — approximated as top-front)
    // -----------------------------------------------------------------------
    vec3 lightDir = normalize(vec3(0.4, 0.8, 1.0));

    // -----------------------------------------------------------------------
    // 5. Compute colour
    // -----------------------------------------------------------------------
    vec3 color = vec3(0.0);

    if (!uSpectrumMode) {
        // --- Discrete RGB mode ---
        // For each channel: I = cos²(θ(z,λ) - φ_view) · cos²(θ(z,λ) - filter2)

        float thetaR = rotationAngle(LAMBDA_R, z);
        float thetaG = rotationAngle(LAMBDA_G, z);
        float thetaB = rotationAngle(LAMBDA_B, z);

        float cr = cos(thetaR - phi_view); cr = cr * cr;
        float cg = cos(thetaG - phi_view); cg = cg * cg;
        float cb = cos(thetaB - phi_view); cb = cb * cb;

        float fr = cos(thetaR - uFilter2Angle); fr = fr * fr;
        float fg = cos(thetaG - uFilter2Angle); fg = fg * fg;
        float fb = cos(thetaB - uFilter2Angle); fb = fb * fb;

        color = vec3(cr * fr, cg * fg, cb * fb);

    } else {
        // --- Continuous spectrum mode (7 sample wavelengths) ---
        // Wavelengths from 380nm to 700nm, 7 steps
        const int N_SAMPLES = 7;
        float wlMin = 380.0;
        float wlMax = 700.0;
        float wlStep = (wlMax - wlMin) / float(N_SAMPLES - 1);

        vec3 accum = vec3(0.0);
        float totalWeight = 0.0;

        for (int i = 0; i < N_SAMPLES; i++) {
            float wl = wlMin + float(i) * wlStep;

            float theta = rotationAngle(wl, z);

            // Rayleigh / Malus scattering + exit polarizer
            float scatter = cos(theta - phi_view);
            scatter = scatter * scatter;

            float malus = cos(theta - uFilter2Angle);
            malus = malus * malus;

            float weight = scatter * malus;

            vec3 spectralRGB = wavelengthToRGB(wl);
            accum += spectralRGB * weight;
            totalWeight += weight;
        }

        // Normalise by total weight (avoid division by zero)
        if (totalWeight > 1e-6) {
            color = accum / totalWeight;
        } else {
            color = vec3(0.0);
        }

        // Re-scale brightness by average Malus transmission
        color *= clamp(totalWeight / float(N_SAMPLES), 0.0, 1.0);
    }

    // Boost saturation / vividness slightly so stripes are clearly visible
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(lum), color, 1.6);
    color = clamp(color, 0.0, 1.0);

    // -----------------------------------------------------------------------
    // 6. Rim darkening
    // -----------------------------------------------------------------------
    color *= rimDarken;

    // -----------------------------------------------------------------------
    // 7. Glass tube specular highlight (Blinn-Phong)
    // -----------------------------------------------------------------------
    // The specular is strongest at the silhouette / rim of the cylinder
    float spec = glassSpecular(N, V, lightDir, 64.0);
    // Weight specular by edge proximity (1 - rimDarken peaks at edges)
    float edgeMask = 1.0 - smoothstep(0.3, 1.0, rimFactor);
    float glassFresnel = pow(1.0 - clamp(NdotV, 0.0, 1.0), 3.0);
    vec3 specColor = vec3(1.0) * spec * (0.4 + 0.6 * glassFresnel);
    color += specColor * (edgeMask * 0.5 + 0.5);

    // -----------------------------------------------------------------------
    // 8. Gamma correction (γ = 2.2)
    // -----------------------------------------------------------------------
    color = clamp(color, 0.0, 1.0);
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
}
