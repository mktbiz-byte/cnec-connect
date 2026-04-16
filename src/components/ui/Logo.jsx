export default function Logo({ size = 28 }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cn-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5B47FB" />
            <stop offset="1" stopColor="#00C2A8" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="8" fill="url(#cn-g)" />
        <path d="M8.5 14a5.5 5.5 0 0 1 10.5-2.4M19 14a5.5 5.5 0 0 1-10.5 2.4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-extrabold tracking-tight text-[18px] text-[#0B0B1A]">CNEC<span className="text-[#5B47FB]"> Connect</span></span>
    </span>
  )
}
