varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec3 vViewDir;
varying vec3 vNormal;

void main() {
    vUv = uv;

    // Local position (before model transform)
    vLocalPos = position;

    // World position
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;

    // View direction in local space
    // cameraPosition is a built-in Three.js uniform (world space)
    vec3 camWorldPos = cameraPosition;
    vec3 worldDir = normalize(worldPos.xyz - camWorldPos);
    // Transform world direction into local space
    mat3 invModel = transpose(inverse(mat3(modelMatrix)));
    vViewDir = normalize(mat3(inverse(modelMatrix)) * worldDir);

    // Surface normal in view space
    vec3 transformedNormal = normalMatrix * normal;
    vNormal = normalize(transformedNormal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
