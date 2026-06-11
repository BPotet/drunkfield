import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

function sendSwMessage(msg: object) {
  navigator.serviceWorker?.controller?.postMessage(msg)
}

export default function SettingsScreen() {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [interval, setInterval] = useState(settings.reminderIntervalMin)
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

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

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-xl font-bold">⚙️ Réglages</h1>

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
