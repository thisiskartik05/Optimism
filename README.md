# 🌀 Optical Rotatory Dispersion & The Barber Pole Effect

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/thisiskartik05/Optimism/blob/main/barber_pole_simulation.ipynb)

A comprehensive, publication-grade interactive Jupyter Notebook simulating the **Barber Pole Effect** (Optical Rotatory Dispersion in a chiral medium, as popularized by 3Blue1Brown) using volumetric raymarching, Cauchy dispersion, and Rayleigh dipole scattering.

---

## 🚀 Instant Presentation

You do **not** need to download or install Python, npm, or any packages locally. You can present and interact with the simulation directly in the cloud:

1. Click the **[Open in Colab](https://colab.research.google.com/github/thisiskartik05/Optimism/blob/main/barber_pole_simulation.ipynb)** badge above.
2. In Google Colab, select **Runtime > Run all** (`Ctrl+F9` / `Cmd+F9`).
3. Use the interactive sliders and 3D viewers to present live.

---

## 🔬 Physics Formulations Implemented

| Phenomenon | Mathematical Formulation | Description |
|---|---|---|
| **Circular Birefringence** | $\Delta \phi = \frac{2\pi}{\lambda}(n_L - n_R)z$ | Chiral sucrose breaks inversion symmetry; eigenmodes $L$ and $R$ experience distinct phase velocities. |
| **Cauchy's ORD** | $\theta(z, \lambda) = \theta_0 + \left(\frac{A}{\lambda^2}\right) \cdot c \cdot z$ | Wavelength-dependent rotation rate. Blue ($450\text{ nm}$) rotates $\approx 2.1\times$ faster than Red ($650\text{ nm}$). |
| **Rayleigh Dipole Scattering** | $I \propto \sin^2\psi \propto \cos^2(\theta(z, \lambda) - \phi_{view})$ | Sugar molecules act as oscillating dipoles; zero radiation along oscillation axis, maximum perpendicular. |
| **Cylindrical Chord Integration** | $L(x) = 2\sqrt{R^2 - x^2}$ | Numerical raymarching integrates varying optical path lengths across the cylinder, mapping the 3D helix into diagonal bands. |
| **"Walking Stripes" Illusion** | $\Delta \theta_0 \to \Delta z = \frac{\Delta \theta_0 \lambda^2}{A c}$ | Rotating the entrance polarizer shifts the spatial boundary phase, translating the diagonal bands along the tube. |

---

## 📊 Notebook Contents (`barber_pole_simulation.ipynb`)

1. **Environment Setup:** Automated dependency verification for Google Colab, JupyterLab, and VS Code.
2. **Theoretical Foundations:** Rigorous mathematical derivations with LaTeX equations.
3. **Spectral Engine:** Accurate CIE 1931 wavelength-to-sRGB mapping for continuous spectrum simulation.
4. **Volumetric Raymarching Engine:** Vectorized numerical integration over cylindrical chords $L(x)$.
5. **Physical Diagnostics:** 4-panel diagnostic plots showing Cauchy curves, RGB pitch differences, dipole patterns, and limb darkening.
6. **High-Resolution Comparison:** Side-by-side comparison of discrete laser trio vs. continuous white light spectrum.
7. **Interactive Dashboard (`ipywidgets`):** Real-time interactive sliders for:
   - Concentration $c$ ($0.1 - 2.0\text{ mol/L}$)
   - Initial Polarizer $\theta_0$ ($0^\circ - 360^\circ$)
   - Exit Polarizer $\theta_2$ ($0^\circ - 360^\circ$)
   - Spectrum Mode toggle (Discrete RGB vs. Continuous Spectrum)
8. **Interactive 3D Trajectory (`plotly`):** 3D rotatable cylinder displaying spatial polarization helices for Red, Green, and Blue light.
9. **Animated Demonstration:** Embedded HTML5/JS animation illustrating the stripes "walking" along the tube as $\theta_0$ rotates.
10. **Presentation Summary & Academic References:** Key conclusions and historical citations (Biot, Cauchy, Fresnel, Hecht, 3B1B).

---

## 💻 Optional Local Execution

If you wish to run the notebook locally on your own machine:

```bash
git clone https://github.com/thisiskartik05/Optimism.git
cd Optimism
pip install numpy matplotlib ipywidgets plotly jupyter
jupyter notebook barber_pole_simulation.ipynb
```
