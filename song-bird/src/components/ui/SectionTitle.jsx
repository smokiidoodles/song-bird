export default function SectionTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-songbird-navy">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-songbird-text-soft">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}