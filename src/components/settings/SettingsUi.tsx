import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { IconSearch } from "../ui/icons";
import { Toggle } from "../ui/Toggle";

/**
 * The SettingsPageHeader component.
 * @param title - The title.
 * @param description - The description.
 * @returns The SettingsPageHeader component.
 */
export function SettingsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="settings-page-header">
      <h2 className="settings-page-header__title">{title}</h2>
      <p className="settings-page-header__description">{description}</p>
    </header>
  );
}

/**
 * The SettingsSearchInput component.
 * @param value - The value.
 * @param onChange - The function to call when the value changes.
 * @param placeholder - The placeholder.
 * @param testId - The test ID.
 * @returns The SettingsSearchInput component.
 */
export function SettingsSearchInput({
  value,
  onChange,
  placeholder,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  testId: string;
}) {
  return (
    <div className="settings-search">
      <IconSearch size={14} className="settings-search__icon" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      />
    </div>
  );
}

/**
 * The SettingsEmptyState component.
 * @param message - The message.
 * @param testId - The test ID.
 * @returns The SettingsEmptyState component.
 */
export function SettingsEmptyState({ message, testId }: { message: string; testId?: string }) {
  return (
    <div className="settings-empty-state" data-testid={testId}>
      <p className="settings-empty-state__message">{message}</p>
    </div>
  );
}

/**
 * The SettingsSection component.
 * @param title - The title.
 * @param description - The description.
 * @param children - The children.
 * @returns The SettingsSection component.
 */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h3 className="settings-section__title">{title}</h3>
        {description && <p className="settings-section__description">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * The SettingsCard component.
 * @param title - The title.
 * @param description - The description.
 * @param headerAction - The header action.
 * @param children - The children.
 * @returns The SettingsCard component.
 */
export function SettingsCard({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="settings-card">
      <div className="settings-card__header">
        <div className="settings-card__header-text">
          <h3 className="settings-card__title">{title}</h3>
          {description && <p className="settings-card__description">{description}</p>}
        </div>
        {headerAction}
      </div>
      <div className="settings-card__body">{children}</div>
    </section>
  );
}

/**
 * The SettingsRow component.
 * @param label - The label.
 * @param hint - The hint.
 * @param children - The children.
 * @param htmlFor - The HTML for.
 * @returns The SettingsRow component.
 */
export function SettingsRow({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row__label-group">
        {htmlFor ? (
          <label className="settings-row__label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="settings-row__label">{label}</span>
        )}
        {hint && <span className="settings-row__hint">{hint}</span>}
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

/**
 * The SettingsSelect component.
 * @param className - The class name.
 * @param props - The props.
 * @returns The SettingsSelect component.
 */
export function SettingsSelect({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`settings-select${className ? ` ${className}` : ""}`}>
      <select className="settings-select__field" {...props} />
    </div>
  );
}

/**
 * The SettingsNumberInput component.
 * @param className - The class name.
 * @param props - The props.
 * @returns The SettingsNumberInput component.
 */
export function SettingsNumberInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      type="number"
      className={`settings-number-input${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

/**
 * The SettingsSegmented component.
 * @param value - The value.
 * @param options - The options.
 * @param onChange - The function to call when the value changes.
 * @param name - The name.
 * @param testId - The test ID.
 * @returns The SettingsSegmented component.
 */
export function SettingsSegmented<T extends string | number>({
  value,
  options,
  onChange,
  name,
  testId,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  name: string;
  testId?: string;
}) {
  return (
    <div className="settings-segmented" role="group" aria-label={name} data-testid={testId}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`settings-segmented__option${
            value === option.value ? " settings-segmented__option--active" : ""
          }`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The SettingsToggleRow component.
 * @param label - The label.
 * @param description - The description.
 * @param props - The props.
 * @returns The SettingsToggleRow component.
 */
export function SettingsToggleRow({
  label,
  description,
  ...props
}: React.ComponentProps<typeof Toggle>) {
  return <Toggle className="toggle--row" label={label} description={description} {...props} />;
}

/**
 * The SettingsDivider component.
 * @returns The SettingsDivider component.
 */
export function SettingsDivider() {
  return <div className="settings-divider" role="separator" />;
}

/**
 * The SettingsCardAction component.
 * @param children - The children.
 * @param props - The props.
 * @returns The SettingsCardAction component.
 */
export function SettingsCardAction({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="sm" {...props}>
      {children}
    </Button>
  );
}
