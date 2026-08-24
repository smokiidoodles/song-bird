import { NavLink } from 'react-router-dom'
import { navItems } from '../../utils/constants'

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="songbird-section sticky top-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-songbird-text-soft">
          Navigation
        </p>
        <nav className="mt-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-berry-crush text-white shadow-lg shadow-berry-crush/20'
                    : 'bg-songbird-surface-soft text-songbird-text hover:bg-wisteria/20'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-wisteria/30 via-periwinkle/30 to-icy-blue/40 p-4">
          <p className="text-sm font-bold text-songbird-navy">Discovery DNA</p>
          <p className="mt-2 text-sm text-songbird-text-soft">
            Warm vocals, global rhythm, mid-tempo groove, moderate novelty.
          </p>
        </div>
      </div>
    </aside>
  )
}