export function DamageXLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer scanning frame */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        stroke="currentColor"
        strokeWidth="2"
        rx="8"
        opacity="0.3"
      />
      
      {/* Corner brackets - top left */}
      <path
        d="M 20 30 L 20 20 L 30 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Corner brackets - top right */}
      <path
        d="M 70 20 L 80 20 L 80 30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Corner brackets - bottom left */}
      <path
        d="M 20 70 L 20 80 L 30 80"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Corner brackets - bottom right */}
      <path
        d="M 70 80 L 80 80 L 80 70"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Central X with scan effect */}
      <path
        d="M 35 35 L 65 65 M 65 35 L 35 65"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center dot/target */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill="currentColor"
      />
      
      {/* Scanning line effect (horizontal) */}
      <line
        x1="25"
        y1="50"
        x2="75"
        y2="50"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}
