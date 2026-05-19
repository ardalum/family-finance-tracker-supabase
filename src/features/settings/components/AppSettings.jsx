import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import {
  currencies,
  defaultAppSettings,
  getCurrencyLabel,
  readAppSettings,
  writeAppSettings,
} from "../appSettings.js";

export default function AppSettings() {
  const [settings, setSettings] = useState(() => readAppSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      writeAppSettings(settings);
      setSaved(true);
      const timer = window.setTimeout(() => setSaved(false), 1400);
      return () => window.clearTimeout(timer);
    } catch {
      setSaved(false);
    }
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function resetSettings() {
    setSettings(defaultAppSettings);
  }

  function updateCurrency(code) {
    const currency = currencies.find((item) => item.code === code) ?? defaultAppSettings.currency;
    updateSetting("currency", currency);
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-muted">Local preferences</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-main">
              Display Settings
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              These settings stay in this browser. They do not change household data, backups,
              cards, budgets, transactions, or recurring payments.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              These display preferences apply when pages refresh or re-render.
            </p>
            {saved ? (
              <p className="mt-2 text-sm font-semibold text-status-successDark">Saved</p>
            ) : null}
          </div>
          <Button type="button" variant="secondary" onClick={resetSettings}>
            Reset Defaults
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsSection
          title="Currency Settings"
          description="Control how money values are displayed."
        >
          <CurrencyPicker selectedCurrency={settings.currency} onChange={updateCurrency} />
          <ToggleRow
            label="Show cents"
            description="Display currency values with two decimal places."
            checked={settings.showCents}
            onChange={(checked) => updateSetting("showCents", checked)}
          />
        </SettingsSection>

        <SettingsSection
          title="Planned preferences"
          description="These settings are not active yet in Spedger."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-muted">
            <li>Date format</li>
            <li>Table density</li>
            <li>Default selected month behavior</li>
            <li>Show zero-balance warning</li>
            <li>Dark mode</li>
          </ul>
          <p className="text-sm text-text-muted">
            These are listed for roadmap transparency only and are not currently configurable.
          </p>
        </SettingsSection>
      </div>
    </section>
  );
}

function CurrencyPicker({ selectedCurrency, onChange }) {
  const selected = selectedCurrency ?? defaultAppSettings.currency;

  return (
    <div className="grid gap-3">
      <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
        Currency
        <select
          className="h-10 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          value={selected.code}
          onChange={(event) => onChange(event.target.value)}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {getCurrencyLabel(currency)}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-text-muted">Selected: {getCurrencyLabel(selected)}</p>
    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <Card className="grid gap-4 p-5">
      <div>
        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </Card>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-app-border bg-app-background p-4">
      <span>
        <span className="block text-sm font-semibold text-text-main">{label}</span>
        <span className="mt-1 block text-sm text-text-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 rounded border-app-border text-brand-primary focus:ring-brand-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
