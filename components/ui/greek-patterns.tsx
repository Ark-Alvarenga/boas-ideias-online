export function GreekMeanderPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <pattern id="meander" patternUnits="userSpaceOnUse" width="20" height="20">
        <path
          d="M0 10 L5 10 L5 5 L15 5 L15 15 L10 15 L10 10 L20 10"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#meander)" />
    </svg>
  )
}

export function GreekColumnLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Column capital (top decorative part) */}
      <rect x="5" y="0" width="50" height="8" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="8" width="44" height="6" rx="1" fill="currentColor" fillOpacity="0.06" />
      <path d="M10 14 Q30 20 50 14 L50 25 Q30 22 10 25 Z" fill="currentColor" fillOpacity="0.05" />
      
      {/* Column shaft with fluting */}
      <rect x="12" y="25" width="36" height="350" fill="currentColor" fillOpacity="0.03" />
      <rect x="14" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="22" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="30" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="38" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      
      {/* Column base */}
      <rect x="8" y="375" width="44" height="6" rx="1" fill="currentColor" fillOpacity="0.06" />
      <rect x="5" y="381" width="50" height="8" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="2" y="389" width="56" height="11" rx="1" fill="currentColor" fillOpacity="0.1" />
    </svg>
  )
}

export function GreekColumnRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'scaleX(-1)' }}
    >
      {/* Column capital */}
      <rect x="5" y="0" width="50" height="8" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="8" width="44" height="6" rx="1" fill="currentColor" fillOpacity="0.06" />
      <path d="M10 14 Q30 20 50 14 L50 25 Q30 22 10 25 Z" fill="currentColor" fillOpacity="0.05" />
      
      {/* Column shaft with fluting */}
      <rect x="12" y="25" width="36" height="350" fill="currentColor" fillOpacity="0.03" />
      <rect x="14" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="22" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="30" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      <rect x="38" y="25" width="4" height="350" fill="currentColor" fillOpacity="0.02" />
      
      {/* Column base */}
      <rect x="8" y="375" width="44" height="6" rx="1" fill="currentColor" fillOpacity="0.06" />
      <rect x="5" y="381" width="50" height="8" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="2" y="389" width="56" height="11" rx="1" fill="currentColor" fillOpacity="0.1" />
    </svg>
  )
}

export function MarbleTexture({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="marble-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1.5" result="light">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="light" mode="multiply" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02" filter="url(#marble-noise)" />
    </svg>
  )
}

export function LaurelWreath({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left branch */}
      <g fillOpacity="0.15" fill="currentColor">
        <ellipse cx="15" cy="20" rx="8" ry="4" transform="rotate(-30 15 20)" />
        <ellipse cx="22" cy="14" rx="7" ry="3.5" transform="rotate(-20 22 14)" />
        <ellipse cx="30" cy="10" rx="6" ry="3" transform="rotate(-10 30 10)" />
        <ellipse cx="38" cy="8" rx="5" ry="2.5" transform="rotate(0 38 8)" />
      </g>
      {/* Right branch */}
      <g fillOpacity="0.15" fill="currentColor">
        <ellipse cx="85" cy="20" rx="8" ry="4" transform="rotate(30 85 20)" />
        <ellipse cx="78" cy="14" rx="7" ry="3.5" transform="rotate(20 78 14)" />
        <ellipse cx="70" cy="10" rx="6" ry="3" transform="rotate(10 70 10)" />
        <ellipse cx="62" cy="8" rx="5" ry="2.5" transform="rotate(0 62 8)" />
      </g>
      {/* Center tie */}
      <circle cx="50" cy="35" r="3" fill="currentColor" fillOpacity="0.1" />
    </svg>
  )
}

export function GreekKeyBorder({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="greek-key" patternUnits="userSpaceOnUse" width="24" height="12">
          <path
            d="M0 6 H6 V0 H18 V12 H12 V6 H24"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeOpacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#greek-key)" />
    </svg>
  )
}
