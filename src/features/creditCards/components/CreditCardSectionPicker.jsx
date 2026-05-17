import Select from "../../../components/ui/Select.jsx";

export default function CreditCardSectionPicker({ sections, activeSection, onSectionChange }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-app-border bg-app-surface p-3">
      <div className="sm:hidden">
        <Select
          label="Workspace section"
          value={activeSection}
          onChange={(event) => onSectionChange(event.target.value)}
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </Select>
      </div>
      <div
        className="hidden flex-wrap gap-2 sm:flex"
        role="toolbar"
        aria-label="Credit card sections"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-text-main text-white shadow-sm"
                  : "text-text-soft hover:bg-app-muted hover:text-text-main"
              }`}
              onClick={() => onSectionChange(section.id)}
              aria-pressed={isActive}
              aria-label={`Show ${section.label} section`}
            >
              <Icon size={16} aria-hidden="true" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
