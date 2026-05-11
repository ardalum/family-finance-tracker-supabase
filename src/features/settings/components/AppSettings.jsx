import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
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
              These settings stay in this browser. They do not change household data,
              backups, cards, budgets, transactions, or recurring payments.
            </p>
            {saved ? <p className="mt-2 text-sm font-semibold text-status-successDark">Saved</p> : null}
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
          <CurrencyPicker
            selectedCurrency={settings.currency}
            onChange={updateCurrency}
          />
          <ToggleRow
            label="Show cents"
            description="Display currency values with two decimal places."
            checked={settings.showCents}
            onChange={(checked) => updateSetting("showCents", checked)}
          />
        </SettingsSection>

        <SettingsSection
          title="Date & Month Settings"
          description="Choose date and default month preferences."
        >
          <Select
            label="Default selected month"
            value={settings.defaultMonthBehavior}
            onChange={(event) => updateSetting("defaultMonthBehavior", event.target.value)}
          >
            <option value="current">Current month</option>
            <option value="last-selected">Last selected month</option>
          </Select>
          <Select
            label="Date format"
            value={settings.dateFormat}
            onChange={(event) => updateSetting("dateFormat", event.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </Select>
        </SettingsSection>

        <SettingsSection
          title="Display Settings"
          description="Adjust how dense tables and alerts feel."
        >
          <Select
            label="Table density"
            value={settings.tableDensity}
            onChange={(event) => updateSetting("tableDensity", event.target.value)}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
          <ToggleRow
            label="Show zero-balance warning"
            description="Keep zero-balance cards visually called out."
            checked={settings.showZeroBalanceWarning}
            onChange={(checked) => updateSetting("showZeroBalanceWarning", checked)}
          />
        </SettingsSection>

        <SettingsSection
          title="Theme"
          description="WalletFlow currently uses a clean light theme."
        >
          <div className="rounded-2xl border border-app-border bg-app-background p-4">
            <p className="text-sm font-semibold text-text-main">Light mode</p>
            <p className="mt-1 text-sm text-text-muted">Current mode</p>
          </div>
          <div className="rounded-2xl border border-app-border bg-app-muted p-4">
            <p className="text-sm font-semibold text-text-soft">Dark mode</p>
            <p className="mt-1 text-sm text-text-muted">Coming soon</p>
          </div>
        </SettingsSection>
      </div>
    </section>
  );
}

function CurrencyPicker({
  selectedCurrency,
  onChange,
}) {
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
      <p className="text-sm text-text-muted">
        Selected: {getCurrencyLabel(selected)}
      </p>
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
