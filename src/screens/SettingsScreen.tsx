import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useSessionStore } from '../stores/sessionStore'

function sendSwMessage(msg: object) {
  navigator.serviceWorker?.controller?.postMessage(msg)
}

export default function SettingsScreen() {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const sessionCode = useSessionStore((s) => s.sessionCode)
  const isHost = useSessionStore((s) => s.isHost)
  const syncActive = useSessionStore((s) => s.syncActive)
  const createSession = useSessionStore((s) => s.createSession)
  const joinSession = useSessionStore((s) => s.joinSession)
  const leaveSession = useSessionStore((s) => s.leaveSession)

  const [interval, setInterval] = useState(settings.reminderIntervalMin)
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  const [joinCode, setJoinCode] = useState('')
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermStatus('unsupported')
    } else {
      setPermStatus(Notification.permission)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleEnableReminders() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermStatus(result)
    await updateSettings({ pushPermissionGranted: result === 'granted' })
    if (result === 'granted') {
      sendSwMessage({ type: 'START_REMINDERS', intervalMin: interval })
    }
  }

  async function handleIntervalChange(val: number) {
    setInterval(val)
    await updateSettings({ reminderIntervalMin: val })
    if (settings.pushPermissionGranted) {
      sendSwMessage({ type: 'SET_INTERVAL', minutes: val })
    }
  }

  async function handleInstall() {
    if (!installPrompt) return
    const evt = installPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> }
    evt.prompt()
    const { outcome } = await evt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  async function handleCreateSession() {
    setSessionLoading(true)
    setSessionError(null)
    try {
      await createSession()
    } catch {
      setSessionError('Impossible de créer la session. Vérifie ta connexion.')
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleJoinSession() {
    if (!joinCode.trim()) return
    setSessionLoading(true)
    setSessionError(null)
    try {
      await joinSession(joinCode.trim())
      setJoinCode('')
    } catch {
      setSessionError('Code invalide ou session introuvable.')
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleLeaveSession() {
    setSessionLoading(true)
    try {
      await leaveSession()
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleCopyCode() {
    if (!sessionCode) return
    await navigator.clipboard.writeText(sessionCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-xl font-bold">⚙️ Réglages</h1>

      {/* Session Groupe */}
      <section className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
        <h2 className="font-semibold">🔗 Session Groupe</h2>

        {sessionCode ? (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs text-zinc-400 mb-1">
                {isHost ? 'Tu as créé cette session' : 'Tu as rejoint cette session'}
              </p>
              <p className="text-4xl font-mono font-bold tracking-widest text-green-400">
                {sessionCode}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Partage ce code avec tes amis</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              {syncActive ? (
                <span className="text-green-400">🟢 Sync active</span>
              ) : (
                <span className="text-red-400">🔴 Sync inactive</span>
              )}
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-semibold"
            >
              {copied ? '✓ Copié !' : 'Copier le code'}
            </button>

            <button
              onClick={handleLeaveSession}
              disabled={sessionLoading}
              className="w-full py-2.5 rounded-xl bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white font-semibold"
            >
              {sessionLoading ? 'En cours…' : 'Quitter la session'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleCreateSession}
              disabled={sessionLoading}
              className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold"
            >
              {sessionLoading ? 'Création…' : 'Créer une session'}
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Code (ex: ABC123)"
                maxLength={6}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 font-mono text-sm focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleJoinSession}
                disabled={sessionLoading || joinCode.trim().length < 1}
                className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold text-sm"
              >
                {sessionLoading ? '…' : 'Rejoindre'}
              </button>
            </div>

            {sessionError && (
              <p className="text-sm text-red-400">{sessionError}</p>
            )}
          </div>
        )}
      </section>

      {/* Reminders */}
      <section className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
        <h2 className="font-semibold">🔔 Rappels d&apos;ivresse</h2>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Rappeler toutes les <strong className="text-white">{interval} min</strong>
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={interval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>5 min</span>
            <span>2 h</span>
          </div>
        </div>

        {permStatus === 'unsupported' ? (
          <p className="text-sm text-zinc-500">Notifications non supportées sur cet appareil.</p>
        ) : permStatus === 'granted' ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span>✓</span>
            <span>Rappels activés</span>
          </div>
        ) : permStatus === 'denied' ? (
          <p className="text-sm text-red-400">
            Notifications refusées. Réactivez-les dans les paramètres du navigateur.
          </p>
        ) : (
          <button
            onClick={handleEnableReminders}
            className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold"
          >
            Activer les rappels
          </button>
        )}
      </section>

      {/* Install PWA */}
      {!installed && (
        <section className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <h2 className="font-semibold mb-2">📱 Installer l&apos;app</h2>
          <p className="text-sm text-zinc-400 mb-3">
            Installez DrunkField sur votre écran d&apos;accueil pour un accès hors-ligne rapide au festival.
          </p>
          {installPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold"
            >
              Installer DrunkField
            </button>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              Sur iOS : touchez le bouton Partager puis &quot;Sur l&apos;écran d&apos;accueil&quot;.
            </p>
          )}
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-yellow-950/40 border border-yellow-800/40 rounded-2xl p-4">
        <h2 className="font-semibold text-yellow-400 mb-2">⚠️ Avertissement</h2>
        <p className="text-xs text-yellow-300/80 leading-relaxed">
          DrunkField est une app de groupe conçue pour le fun. Les estimations d&apos;alcoolémie
          sont approximatives et non médicales. Ne conduisez jamais après avoir consommé de
          l&apos;alcool. Buvez avec modération.
        </p>
      </section>

      {/* Version */}
      <p className="text-xs text-zinc-600 text-center">DrunkField v0.1.0 · Greenfield Festival</p>
    </div>
  )
}
