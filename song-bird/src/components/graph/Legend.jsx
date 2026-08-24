export default function Legend({ showEdges = false }) {
  return (
    <div className="rounded-3xl border border-songbird-border bg-white p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-songbird-text-soft">
        Legend
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-berry-crush" />
            <span className="text-sm text-songbird-text">Artist</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-wisteria" />
            <span className="text-sm text-songbird-text">Producer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-periwinkle" />
            <span className="text-sm text-songbird-text">Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-icy-blue" />
            <span className="text-sm text-songbird-text">Country</span>
          </div>
        </div>

        {showEdges && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-songbird-text">Relationship types</p>
            <ul className="list-disc pl-5 text-sm text-songbird-text-soft">
              <li>Artist → Producer: produced_by</li>
              <li>Artist → Studio: recorded_at</li>
              <li>Artist → Country: from_country</li>
              <li>Artist ↔ Artist: same_country</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}