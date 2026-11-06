import React from 'react'

function SliderRow({ label, symbol, value, min, max, step, unit, onChange, displayValue }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-300">
          {symbol && (
            <span className="text-indigo-400 mr-1">{symbol}</span>
          )}
          {label}
        </span>
        <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded text-indigo-300">
          {displayValue !== undefined ? displayValue : value}
          {unit && <span className="text-gray-400 ml-1">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700"
        style={{ accentColor: '#6366f1' }}
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-500">{min}{unit}</span>
        <span className="text-[10px] text-gray-500">{max}{unit}</span>
      </div>
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <p className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold mb-3">
      {children}
    </p>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-mono text-cyan-300">{value}</span>
    </div>
  )
}

export default function ControlPanel({
  concentration,
  setConcentration,
  theta0,
  setTheta0,
  filter2Angle,
  setFilter2Angle,
  spectrumMode,
  setSpectrumMode,
}) {
  // theta0 and filter2Angle are stored externally in radians;
  // sliders operate in degrees and convert on change.
  const theta0Deg      = Math.round((theta0      * 180) / Math.PI)
  const filter2AngleDeg = Math.round((filter2Angle * 180) / Math.PI)

  // ORD formula: α(λ) = (A / λ²) * c * L   where A=21000, L=2 (half-height)
  function ordDeg(lambdaNm) {
    return ((21000 / (lambdaNm * lambdaNm)) * concentration * 2.0).toFixed(1)
  }

  return (
    <div
      className="
        fixed top-4 right-4 bottom-4 z-50
        w-72 flex flex-col
        bg-gray-900/90 backdrop-blur-md
        rounded-xl shadow-2xl shadow-black/60
        border border-gray-700/50
        text-white overflow-y-auto
      "
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Barber Pole Effect
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Optical Rotatory Dispersion</p>
      </div>

      {/* Gradient divider */}
      <div className="h-px mx-5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex-1 px-5 py-4 space-y-5">

        {/* Chiral Medium */}
        <div>
          <SectionHeader>Chiral Medium</SectionHeader>
          <SliderRow
            label="Concentration"
            symbol="c"
            value={concentration}
            min={0}
            max={1}
            step={0.01}
            unit="mol/L"
            displayValue={concentration.toFixed(2)}
            onChange={(e) => setConcentration(parseFloat(e.target.value))}
          />
        </div>

        {/* Thin rule */}
        <div className="h-px bg-gray-800" />

        {/* Polarizers */}
        <div>
          <SectionHeader>Polarizers</SectionHeader>
          <SliderRow
            label="Initial Polarizer"
            symbol="θ₀"
            value={theta0Deg}
            min={0}
            max={360}
            step={1}
            unit="°"
            displayValue={`${theta0Deg}°`}
            onChange={(e) => setTheta0((parseFloat(e.target.value) * Math.PI) / 180)}
          />
          <SliderRow
            label="Exit Polarizer"
            symbol="θ₂"
            value={filter2AngleDeg}
            min={0}
            max={360}
            step={1}
            unit="°"
            displayValue={`${filter2AngleDeg}°`}
            onChange={(e) => setFilter2Angle((parseFloat(e.target.value) * Math.PI) / 180)}
          />
        </div>

        {/* Thin rule */}
        <div className="h-px bg-gray-800" />

        {/* Spectrum Mode */}
        <div>
          <SectionHeader>Spectrum Mode</SectionHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">
              {spectrumMode ? 'Continuous' : 'RGB Bands'}
            </span>
            <button
              onClick={() => setSpectrumMode((prev) => !prev)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-300 focus:outline-none
                ${spectrumMode ? 'bg-indigo-500' : 'bg-gray-600'}
              `}
              aria-label="Toggle spectrum mode"
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow
                  transition-transform duration-300
                  ${spectrumMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            {spectrumMode
              ? 'Full visible spectrum sampled across wavelengths.'
              : 'Three discrete bands: red, green, blue.'}
          </p>
        </div>

        {/* Thin rule */}
        <div className="h-px bg-gray-800" />

        {/* Physics Info */}
        <div>
          <SectionHeader>Physics Info</SectionHeader>
          <div className="bg-gray-800/60 rounded-lg px-3 py-2 space-y-0.5">
            <InfoRow label="ORD (Red 650 nm)"   value={`${ordDeg(650)}°`} />
            <InfoRow label="ORD (Green 532 nm)" value={`${ordDeg(532)}°`} />
            <InfoRow label="ORD (Blue 450 nm)"  value={`${ordDeg(450)}°`} />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            Rotation at mid-cylinder (z = 2). Formula: α = (21000/λ²) · c · L
          </p>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-gray-800/80">
        <p className="text-[10px] text-center text-gray-600 tracking-wide">
          Built with Three.js + GLSL
        </p>
      </div>
    </div>
  )
}
