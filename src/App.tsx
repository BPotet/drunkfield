import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMembersStore } from './stores/membersStore'
import HomeScreen from './screens/HomeScreen'
import DrinkLogScreen from './screens/DrinkLogScreen'
import MembersScreen from './screens/MembersScreen'
import RatingScreen from './screens/RatingScreen'
import SettingsScreen from './screens/SettingsScreen'

function Onboarding() {
  const members = useMembersStore((s) => s.members)
  const hydrated = useMembersStore((s) => s.hydrated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (hydrated && members.length === 0 && location.pathname === '/') {
      navigate('/members', { replace: true })
    }
  }, [hydrated, members.length, location.pathname, navigate])

  return null
}

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: '🏠' },
  { to: '/drinks', label: 'Binche', icon: '🍺' },
  { to: '/rate', label: 'Ivresse', icon: '🥴' },
  { to: '/members', label: 'Groupe', icon: '👥' },
  { to: '/settings', label: 'Réglages', icon: '⚙️' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 pb-safe z-50">
      <div className="flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-green-400' : 'text-zinc-400'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Onboarding />
      <div className="pb-safe">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/drinks" element={<DrinkLogScreen />} />
          <Route path="/rate" element={<RatingScreen />} />
          <Route path="/members" element={<MembersScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  )
}
