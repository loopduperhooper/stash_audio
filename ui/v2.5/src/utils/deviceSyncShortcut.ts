interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export const DEFAULT_DEVICE_SYNC_SHORTCUT = "PageDown";

export function deviceSyncShortcut(event: ShortcutEvent): string | null {
  if (["Control", "Alt", "Shift", "Meta", "Dead", "Unidentified"].includes(event.key)) {
    return null;
  }
  const modifiers = [
    event.ctrlKey ? "Ctrl" : "",
    event.altKey ? "Alt" : "",
    event.shiftKey ? "Shift" : "",
    event.metaKey ? "Meta" : "",
  ].filter(Boolean);
  const key = event.key === " " ? "Space" : event.key;
  return [...modifiers, key.length === 1 ? key.toUpperCase() : key].join("+");
}
