export function RiseStroke({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 90"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 80C50 80 70 80 95 60C112 46 100 30 86 36C72 42 80 62 100 66C140 74 168 50 196 18C204 9 210 4 234 6"
        stroke="url(#rise-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength="1"
        className="rise-stroke"
      />
      <defs>
        <linearGradient id="rise-grad" x1="0" y1="90" x2="240" y2="0">
          <stop offset="0%" stopColor="#E0156A" />
          <stop offset="100%" stopColor="#7A1352" />
        </linearGradient>
      </defs>
    </svg>
  );
}
