# 🌀 Optimism — Barber Pole Effect · Optical Rotatory Dispersion

An interactive, university-grade 3D simulation of the **Barber Pole Effect** (Optical Rotatory Dispersion in a chiral medium) built with React, Three.js, and custom GLSL shaders.

---

## Physics Implemented

| Phenomenon | Implementation |
|---|---|
| **Optical Rotatory Dispersion (ORD)** | Cauchy's approximation: `θ(z,λ) = θ₀ + (A/λ²) · c · z` where `A = 21,000 deg·nm²` |
| **Rayleigh Scattering (Malus's Law)** | `I ∝ cos²(θ(z,λ) − φ_view)` per RGB channel |
| **Exit Polarizer** | Second Malus factor: `I_final ∝ cos²(θ(z,λ) − θ₂)` |
| **Cylindrical Geometry** | Azimuthal angle `φ` from UV.x; camera XY projection gives `φ_view` |
| **Wavelengths** | Discrete: R=650 nm, G=532 nm, B=450 nm · Continuous: 7 samples 380–700 nm |
| **Glass Tube** | Blinn-Phong specular + Fresnel rim on a `MeshPhysicalMaterial` outer shell |

---

## Tech Stack

- **React 18** + **Vite 5**
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **Custom GLSL** vertex & fragment shaders (`ordShader.vert` / `ordShader.frag`)
- **Tailwind CSS v3**

---

## File Structure

```
Optimism/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── App.jsx                          # Root: Canvas + ControlPanel
    ├── main.jsx                         # ReactDOM entry
    ├── index.css                        # Tailwind directives + resets
    ├── components/
    │   ├── BarberPoleSimulation.jsx     # Three.js scene, cylinder, lights, orbit
    │   └── ControlPanel.jsx             # Sidebar UI with sliders & toggle
    └── shaders/
        ├── ordShader.vert               # Vertex shader — passes varyings
        └── ordShader.frag               # Fragment shader — full ORD physics
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → http://localhost:5173

# 3. Production build
npm run build
npm run preview
```

---

## UI Controls

| Control | Effect |
|---|---|
| **Concentration (c)** | Sugar concentration in mol/L — higher = more rotation per unit length |
| **θ₀ Initial Polarizer** | Rotates the entry polarizer — stripes "walk" along the tube |
| **θ₂ Exit Polarizer** | Applies Malus's Law at the exit — dims/shifts the stripe pattern |
| **Spectrum Mode** | Toggle between 7-wavelength continuous spectrum and discrete RGB bands |

---

## Controls

- **Left-drag** — orbit around the cylinder
- **Scroll** — zoom
- **Right-drag** — pan

---

*Built for a university Optics project. All physics computed per-fragment on the GPU.*
