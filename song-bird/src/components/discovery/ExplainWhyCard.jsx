export default function ExplainWhyCard({ artist }) {
  return (
    <section className="songbird-section">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
        Explainable recommendation
      </p>
      <h3 className="text-xl font-bold text-songbird-navy">
        Why Song Bird picked {artist.name}
      </h3>
      <div className="space-y-3">
        {artist.whyRecommended.map((reason) => (
          <div
            key={reason}
            className="rounded-2xl bg-songbird-surface-soft px-4 py-3 text-sm leading-6 text-songbird-text-soft"
          >
            {reason}
          </div>
        ))}
      </div>
    </section>
  )
}