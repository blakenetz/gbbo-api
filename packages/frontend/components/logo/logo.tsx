interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Same artwork as app/icon.svg, without the background tile.
export default function Logo({ size = 40, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M32 10.5Q34 5.5 39 5.5"
        fill="none"
        stroke="#4e2f21"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 37C9 33 12 25 19 26C19 19 27 15 32 19C37 15 45 19 45 26C52 25 55 33 50 37Z"
        fill="#fdf8f1"
        stroke="#4e2f21"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M23 30l3-1.5M35 24l2 2M39 31.5l3-1M28 24.5l1.5 2.5" stroke="#5eae9f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M31 31l1.5 2.5M22 34.5l2.5-1" stroke="#c189aa" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="15" r="4.5" fill="#c2415d" stroke="#4e2f21" strokeWidth="3" />
      <path
        d="M16 37h32l-5 19H21z"
        fill="#76c6b6"
        stroke="#4e2f21"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M26 39.5l1.5 14M32 39.5v14M38 39.5l-1.5 14"
        stroke="#4e2f21"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
