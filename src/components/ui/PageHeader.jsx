export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="px-6 md:px-10 pt-8 pb-6 bg-white border-b border-[#EEF0F4]">
      <div className="max-w-[1280px] mx-auto flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-extrabold tracking-tight text-[#0B0B1A]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] text-[#6B7280]">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
