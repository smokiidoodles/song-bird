import { useMemo } from 'react'
import Legend from './Legend'

export default function ArtistNodeGraph({ graph }) {
  const { nodes, edges } = graph

  const byType = useMemo(() => {
    const groups = { artist: [], producer: [], studio: [], country: [] }
    nodes.forEach((n) => {
      if (groups[n.type]) groups[n.type].push(n)
    })
    return groups
  }, [nodes])

  const nodeColor = (type) => {
    switch (type) {
      case 'artist':
        return 'bg-berry-crush text-white'
      case 'producer':
        return 'bg-wisteria text-songbird-navy'
      case 'studio':
        return 'bg-periwinkle text-songbird-navy'
      case 'country':
        return 'bg-icy-blue text-songbird-navy'
      default:
        return 'bg-songbird-surface text-songbird-text'
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-songbird-text-soft">
        <div className="rounded-2xl bg-songbird-surface-soft p-3">
          <p className="font-bold">Nodes</p>
          <ul className="mt-2 space-y-1">
            <li>Artists: {byType.artist.length}</li>
            <li>Producers: {byType.producer.length}</li>
            <li>Studios: {byType.studio.length}</li>
            <li>Countries: {byType.country.length}</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-songbird-surface-soft p-3">
          <p className="font-bold">Edges</p>
          <p className="mt-2 text-sm">Total: {edges.length}</p>
        </div>
      </div>

      <div className="songbird-scrollbar relative h-96 overflow-auto rounded-3xl border border-songbird-border bg-songbird-surface-soft p-4">
        <div className="flex gap-8">
          {Object.entries(byType).map(([type, items]) => (
            <div key={type} className="shrink-0">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-songbird-text-soft">
                {type}s
              </h4>
              <div className="flex flex-col gap-3">
                {items.map((node) => (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold ${nodeColor(
                      node.type
                    )}`}
                    title={`${node.label} (${node.type})`}
                  >
                    <div className="h-3 w-3 shrink-0 rounded-full bg-white/60" />
                    <span className="max-w-[160px] truncate">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
      </div>

      <div className="mt-6">
        <Legend showEdges />
      </div>

      <p className="mt-4 text-xs text-songbird-text-soft">
        Edges are not drawn in this minimal version; instead, the graph is shown
        as grouped nodes by type. In a later phase, this can be replaced or
        enhanced with a proper force-directed or hierarchical layout.
      </p>
    </div>
  )
}