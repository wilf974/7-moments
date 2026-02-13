const CANONICAL_HOURS = [
  { key: "vigiles", name: "Vigiles", hour: 3, minute: 0 },
  { key: "laudes", name: "Laudes", hour: 6, minute: 0 },
  { key: "tierce", name: "Tierce", hour: 9, minute: 0 },
  { key: "sexte", name: "Sexte", hour: 12, minute: 0 },
  { key: "none", name: "None", hour: 15, minute: 0 },
  { key: "vepres", name: "Vêpres", hour: 18, minute: 0 },
  { key: "complies", name: "Complies", hour: 21, minute: 0 },
];

export { CANONICAL_HOURS };

const STORAGE_KEY = 'reminder_settings';

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Check if notifications are supported and permission is granted
 */
export function isNotificationEnabled(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Get all reminder settings from localStorage
 */
export function getEnabledReminders(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Enable/disable a specific reminder
 */
export function setReminderEnabled(key: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  const reminders = getEnabledReminders();
  reminders[key] = enabled;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

// Store timeout IDs for cleanup
let scheduledTimeouts: NodeJS.Timeout[] = [];

/**
 * Schedule notifications for all enabled reminders
 * Uses setTimeout for the next upcoming canonical hour
 */
export function scheduleReminders(): void {
  cancelReminders(); // Clear existing

  if (!isNotificationEnabled()) return;

  const reminders = getEnabledReminders();
  const now = new Date();

  CANONICAL_HOURS.forEach((hour) => {
    if (!reminders[hour.key]) return;

    // Calculate next occurrence
    const target = new Date(now);
    target.setHours(hour.hour, hour.minute, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      // Find the index of this hour in the array (1-based)
      const index = CANONICAL_HOURS.findIndex(h => h.key === hour.key) + 1;

      new Notification(`🕯️ ${hour.name}`, {
        body: `C'est l'heure de ${hour.name} - votre ${index}e rendez-vous avec Dieu`,
        icon: '/favicon-32x32.png',
        tag: hour.key,
      });

      // Re-schedule for the next day
      scheduleReminders();
    }, delay);

    scheduledTimeouts.push(timeoutId);
  });
}

/**
 * Cancel all scheduled reminders
 */
export function cancelReminders(): void {
  scheduledTimeouts.forEach(id => clearTimeout(id));
  scheduledTimeouts = [];
}

/**
 * Check if any reminder is enabled
 */
export function hasAnyReminderEnabled(): boolean {
  const reminders = getEnabledReminders();
  return Object.values(reminders).some(v => v);
}
