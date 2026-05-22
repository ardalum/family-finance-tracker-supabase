import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, WalletCards, X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to Spedger",
    copy: "Spedger helps your household track income, accounts, spending, budgets, bills, cards, goals, and insights in one place.",
    icon: Sparkles,
    primaryLabel: "Start walkthrough",
  },
  {
    id: "money-center",
    title: "Start with Money Center",
    copy: "Add income, tracked accounts, and balance snapshots so Cash Position has a reliable starting point.",
    icon: WalletCards,
    actions: [{ label: "Open Money Center", view: "financial-position" }],
  },
  {
    id: "transactions",
    title: "Add transactions",
    copy: "Track spending and income activity so budgets and insights stay accurate.",
    icon: ArrowRight,
    actions: [{ label: "Open Transactions", view: "spending" }],
  },
  {
    id: "budgets",
    title: "Plan your monthly budget",
    copy: "Set category budgets and compare actual spending against your plan.",
    icon: ArrowRight,
    actions: [{ label: "Open Budgets", view: "budgets" }],
  },
  {
    id: "bills-cards",
    title: "Track bills and cards",
    copy: "Add recurring bills and credit cards so Spedger can show due dates, payment status, and obligations.",
    icon: ArrowRight,
    actions: [
      { label: "Open Bills", view: "recurring" },
      { label: "Open Cards & Debt", view: "credit-cards" },
    ],
  },
  {
    id: "goals-insights",
    title: "Review goals and insights",
    copy: "Track savings goals and use insights to spot trends, budget pressure, and progress.",
    icon: ArrowRight,
    actions: [
      { label: "Open Goals", view: "savings" },
      { label: "Open Insights", view: "insights" },
    ],
  },
  {
    id: "ready",
    title: "You are ready",
    copy: "You can restart this walkthrough anytime from Help Center or Settings.",
    icon: CheckCircle2,
    primaryLabel: "Finish",
  },
];

export default function OnboardingWalkthrough({ open, onClose, onFinish, onSkip, onNavigate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = onboardingSteps.length;
  const step = onboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  const progressWidth = `${((stepIndex + 1) / totalSteps) * 100}%`;
  const Icon = step.icon;

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleEscClose(event) {
      if (event.key !== "Escape") return;
      onSkip?.();
    }

    window.addEventListener("keydown", handleEscClose);
    return () => window.removeEventListener("keydown", handleEscClose);
  }, [onSkip, open]);

  const stepTitleId = useMemo(() => `onboarding-step-title-${step.id}`, [step.id]);

  if (!open) return null;

  function goToPreviousStep() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goToNextStep() {
    setStepIndex((current) => Math.min(totalSteps - 1, current + 1));
  }

  function handlePrimaryAction() {
    if (isLastStep) {
      onFinish?.();
      return;
    }
    goToNextStep();
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#F9FAFB]/85 px-4 py-4 backdrop-blur-[1px] sm:py-8">
      <Card className="w-full max-w-2xl overflow-hidden">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={stepTitleId}
          className="grid max-h-[90vh] min-h-[360px] grid-rows-[auto_auto_1fr_auto] bg-app-surface"
        >
          <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
            <p className="text-sm font-semibold text-text-soft">
              Step {stepIndex + 1} of {totalSteps}
            </p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-soft transition hover:bg-app-muted hover:text-text-main"
              onClick={onClose}
              aria-label="Close walkthrough"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="h-1.5 w-full bg-app-muted">
            <div
              className="h-full bg-brand-primary transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <Icon size={21} aria-hidden="true" />
            </div>

            <h2
              id={stepTitleId}
              className="mt-4 text-2xl font-semibold tracking-tight text-text-main"
            >
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">{step.copy}</p>

            {step.actions?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {step.actions.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant="secondary"
                    className="justify-start text-left"
                    onClick={() => onNavigate?.(action.view)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-app-border px-5 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={goToPreviousStep}
                disabled={isFirstStep}
              >
                Back
              </Button>
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip
              </Button>
            </div>
            <Button type="button" onClick={handlePrimaryAction}>
              {step.primaryLabel ?? "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
