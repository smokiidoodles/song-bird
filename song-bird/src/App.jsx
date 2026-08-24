import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import ArtistsPage from './pages/ArtistsPage'
import ArtistProfilePage from './pages/ArtistProfilePage'
import PlaylistPage from './pages/PlaylistPage'
import InsightsPage from './pages/InsightsPage'
import ExplorePage from './pages/ExplorePage'
import GraphPage from './pages/GraphPage'
import AuthPage from './pages/AuthPage'
import { SongbirdStateProvider } from './hooks/useSongbirdState'
import AccountPage from './pages/AccountPage'

function SongBirdApp() {
  return (
    <SongbirdStateProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:spotifyId" element={<ArtistProfilePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </SongbirdStateProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/*" element={<SongBirdApp />} />
    </Routes>
  )
}