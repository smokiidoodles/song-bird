import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="songbird-shell">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-8 pt-4 lg:px-6">
        <Sidebar />
        <main className="min-w-0 flex-1 space-y-6">{children}</main>
      </div>
    </div>
  )
}