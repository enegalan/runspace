import { Kbd } from "../../components/ui/Kbd";
import { APP_SHORTCUTS } from "../../core/constants/keyboardShortcuts";

export function ShortcutList({ className = "" }: { className?: string }) {
  return (
    <ul className={`shortcuts-dialog__list${className ? ` ${className}` : ""}`}>
      {APP_SHORTCUTS.map((shortcut) => (
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
