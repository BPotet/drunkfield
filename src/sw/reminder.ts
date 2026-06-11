/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope

clientsClaim()
self.skipWaiting()

// self.__WB_MANIFEST is injected by workbox at build time
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Reminder timer ──────────────────────────────────────────────────────────

let reminderTimer: ReturnType<typeof setTimeout> | null = null
let reminderIntervalMs = 30 * 60 * 1000

function scheduleReminder() {
  if (reminderTimer) clearTimeout(reminderTimer)
  reminderTimer = setTimeout(async () => {
    try {
      await self.registration.showNotification('DrunkField 🍺', {
        body: 'Comment tu te sens ? Note ton ivresse !',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'drunkfield-reminder',
        renotify: true,
        data: { url: '/rate' },
      } as NotificationOptions)
    } catch (_) {
      // notifications may be blocked — fail silently
    }
    scheduleReminder()
  }, reminderIntervalMs)
}

self.addEventListener('message', (event) => {
  if (!event.data) return

  switch (event.data.type) {
    case 'START_REMINDERS':
      if (event.data.intervalMin) {
        reminderIntervalMs = event.data.intervalMin * 60 * 1000
      }
      scheduleReminder()
      break

    case 'SET_INTERVAL':
      reminderIntervalMs = (event.data.minutes || 30) * 60 * 1000
      scheduleReminder()
      break

    case 'STOP_REMINDERS':
      if (reminderTimer) {
        clearTimeout(reminderTimer)
        reminderTimer = null
      }
      break
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = (event.notification.data as { url?: string })?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            return
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})
