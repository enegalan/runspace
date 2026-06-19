import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Input } from "../ui/Input";
import { Toggle } from "../ui/Toggle";

export function SettingsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="settings-page-header">
      <h2 className="settings-page-header__title">{title}</h2>
      <p className="settings-page-header__description">{description}</p>
    </header>
  );
}

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
      <div
        className={`settings-card__header${
          headerAction ? " settings-card__header--with-action" : ""
        }`}
      >
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

export function SettingsToggleRow({
  label,
  description,
  ...props
}: React.ComponentProps<typeof Toggle>) {
  return <Toggle className="toggle--row" label={label} description={description} {...props} />;
}

export function SettingsDivider() {
  return <div className="settings-divider" role="separator" />;
}
