// ─────────────────────────────────────────────────────────────────────────────
// ordShader.vert  —  Volumetric Raymarching Vertex Shader
//
// Passes two things to the fragment stage:
//   vLocalPos     : the vertex's position in model (local) space.
//                   The fragment shader uses it as the "look-at" point for the
//                   ray direction, so every fragment owns its own ray.
//   vCamPosLocal  : the camera's world-space position transformed into local
//                   space.  This is the ray origin for every fragment on the
//                   bounding volume.
//
// The inverse of modelMatrix is computed in GLSL (available in GLSL ES 3.0 /
// WebGL 2, which Three.js r168+ uses by default).
// ─────────────────────────────────────────────────────────────────────────────

varying vec3 vLocalPos;
varying vec3 vCamPosLocal;

void main() {
    // Local-space vertex position — becomes the ray's target point
    vLocalPos = position;

    // Camera world position → local space via the model matrix inverse.
    // Three.js exposes `modelMatrix` and `cameraPosition` as built-in uniforms.
    vCamPosLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;

    // Standard clip-space transform
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
