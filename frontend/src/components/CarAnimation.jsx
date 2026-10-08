function CarAnimation() {
  return (
    <div className="car-animation-track" aria-hidden="true">
      <svg className="car-animation-svg" viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="65" cy="56" rx="52" ry="4" fill="rgba(0,0,0,0.18)" />

        <rect x="15" y="30" width="100" height="16" rx="8" fill="#ffffff" opacity="0.92" />
        <path d="M30 30 L45 14 L85 14 L100 30 Z" fill="#ffffff" opacity="0.92" />

        <rect x="50" y="17" width="14" height="10" rx="1" fill="#0f0b17" opacity="0.35" />
        <rect x="68" y="17" width="14" height="10" rx="1" fill="#0f0b17" opacity="0.35" />

        <circle cx="18" cy="34" r="2.6" fill="#dc2626" />
        <circle cx="112" cy="34" r="2.8" fill="#FCDE5A" />

        <g className="car-wheel" style={{ transformOrigin: '35px 48px' }}>
          <circle cx="35" cy="48" r="8" fill="#0f0b17" />
          <line x1="35" y1="42" x2="35" y2="54" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
        </g>
        <g className="car-wheel" style={{ transformOrigin: '95px 48px' }}>
          <circle cx="95" cy="48" r="8" fill="#0f0b17" />
          <line x1="95" y1="42" x2="95" y2="54" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}

export default CarAnimation;