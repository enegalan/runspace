import { useMemo } from "react";
import { Kbd } from "../../components/ui/Kbd";
import { shortcutsToAppShortcuts } from "../../core/constants/keyboardShortcuts";
import { useSettingsStore } from "../../stores/settingsStore";

/**
 * The ShortcutList component.
 * @param className - The class name.
 * @returns The ShortcutList component.
 */
export function ShortcutList({ className = "" }: { className?: string }) {
  const shortcuts = useSettingsStore((state) => state.settings.shortcuts);
  const items = useMemo(() => shortcutsToAppShortcuts(shortcuts), [shortcuts]);

  return (
    <ul className={`shortcuts-dialog__list${className ? ` ${className}` : ""}`}>
      {items.map((shortcut) => (
        <li key={shortcut.action} className="shortcuts-dialog__item">
          <span>{shortcut.action}</span>
          <span className="shortcuts-dialog__keys">
            {shortcut.keys.map((key, index) => (
              <Kbd key={`${shortcut.action}-${index}`}>{key}</Kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
