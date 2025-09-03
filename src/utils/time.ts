/**
 * Creates a Date String based on the time passed since the given date
 * @param date Date to be formatted
 * @returns `HH:MM` if date within 24 hours, `Weekday HH:MM` if date within 7 days, else `MM/DD/YYYY`
 */
export function getFormattedDate(date: Date): string {
  try {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (0 <= diff && diff <= 604800000) // 7 Days
      return date.toLocaleTimeString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    else
      return date.toLocaleDateString();
  } catch (err) {
    console.error(err);
  }
  return "";
}
