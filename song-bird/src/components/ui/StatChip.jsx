export default function StatChip({ label, value, tone = 'default' }) {
  const toneMap = {
    default: 'bg-songbird-surface-soft text-songbird-text',
    berry: 'bg-berry-crush text-white',
    blue: 'bg-icy-blue text-songbird-navy',
    green: 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className={`rounded-2xl px-3 py-2 ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  )
}