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
    helperTitle: "What you can do here",
    helperCopy:
      "Use Spedger as your family finance command center: track money coming in, what goes out, what is due, and what needs attention.",
    iconTone: "bg-[#EAF2FF] text-[#0A1F46]",
  },
  {
    id: "money-center",
    title: "Start with Money Center",
    copy: "Add income, tracked accounts, and balance snapshots so Cash Position has a reliable starting point.",
    icon: WalletCards,
    actions: [{ label: "Open Money Center", view: "financial-position" }],
    helperTitle: "Suggested first step",
    helperCopy:
      "Add your tracked accounts and starting balance snapshots before relying on Cash Position.",
    iconTone: "bg-[#ECF3FF] text-[#0A1F46]",
  },
  {
    id: "transactions",
    title: "Add transactions",
    copy: "Track spending and income activity so budgets and insights stay accurate.",
    icon: ArrowRight,
    actions: [{ label: "Open Transactions", view: "spending" }],
    helperTitle: "What to do here",
    helperCopy:
      "Log everyday purchases, income activity, and account-based spending so Spedger can keep your monthly view accurate.",
    iconTone: "bg-[#FFF4E6] text-[#9A4F00]",
  },
  {
    id: "budgets",
    title: "Plan your monthly budget",
    copy: "Set category budgets and compare actual spending against your plan.",
    icon: ArrowRight,
    actions: [{ label: "Open Budgets", view: "budgets" }],
    helperTitle: "What to do here",
    helperCopy:
      "Create category limits for the month, then review which areas are on track, near limit, or over budget.",
    iconTone: "bg-[#EEF8F1] text-[#166534]",
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
    helperTitle: "What to do here",
    helperCopy:
      "Use Bills for recurring obligations and Cards & Debt for card balances, due dates, and payment tracking.",
    iconTone: "bg-[#FFF6EB] text-[#9A4F00]",
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
    helperTitle: "What to do here",
    helperCopy:
      "Use Goals to track progress and Insights to review patterns that may need attention.",
    iconTone: "bg-[#ECF3FF] text-[#0A1F46]",
  },
  {
    id: "ready",
    title: "You are ready",
    copy: "You can restart this walkthrough anytime from Help Center or Settings.",
    icon: CheckCircle2,
    primaryLabel: "Finish",
    helperTitle: "You can come back anytime",
    helperCopy:
      "Restart this walkthrough from Help Center or Settings whenever you want a quick refresher.",
    iconTone: "bg-[#EAF8EF] text-[#166534]",
  },
];

export default function OnboardingWalkthrough({ open, onClose, onFinish, onSkip, onNavigate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = onboardingSteps.length;
  const step = onboardingSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  const progressValue = stepIndex + 1;
  const Icon = step.icon;
  const stepTitleId = useMemo(() => `onboarding-step-title-${step.id}`, [step.id]);

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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[2px] sm:p-6">
      <Card
        className="w-full max-w-[40rem] overflow-hidden rounded-[24px] border-[#E8E2D6] bg-[#FBF8F2] shadow-[0_30px_90px_-40px_rgba(15,23,42,0.48)]"
        data-testid="onboarding-modal"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={stepTitleId}
          className="grid max-h-[calc(100vh-2rem)] grid-rows-[auto_auto_1fr_auto]"
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-7 sm:pb-4 sm:pt-6">
            <div className="grid gap-0.5">
              <p className="text-sm font-semibold text-text-soft">
                Step {progressValue} of {totalSteps}
              </p>
              <p className="text-xs font-medium text-text-muted">Spedger walkthrough</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-soft transition hover:bg-app-muted hover:text-text-main"
              onClick={onClose}
              aria-label="Close walkthrough"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 pb-4 sm:px-7">
            <div className="h-2 rounded-full bg-[#ECE7DC]" aria-label="Walkthrough progress">
              <div
                className="h-2 rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${(progressValue / totalSteps) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
              {onboardingSteps.map((currentStep, index) => {
                const isCurrent = index === stepIndex;
                const isComplete = index < stepIndex;
                return (
                  <span
                    key={currentStep.id}
                    className={`h-2.5 w-2.5 rounded-full ${
                      isCurrent
                        ? "bg-brand-primary"
                        : isComplete
                          ? "bg-brand-primary/50"
                          : "bg-[#D8D1C1]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-6">
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconTone}`}
            >
              <Icon size={24} aria-hidden="true" />
            </div>

            <h2
              id={stepTitleId}
              className="mt-4 text-3xl font-semibold tracking-tight text-text-main"
            >
              {step.title}
            </h2>
            <p className="mt-2 max-w-[56ch] text-[15px] leading-7 text-text-muted">{step.copy}</p>

            <div className="mt-5 rounded-2xl border border-[#E7DFD1] bg-white/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
                {step.helperTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-main">{step.helperCopy}</p>
            </div>

            {step.actions?.length ? (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {step.actions.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant="secondary"
                    className="bg-white/90 text-sm"
                    onClick={() => onNavigate?.(action.view)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#E8E2D6] bg-[#F8F4EC] px-5 py-4 sm:px-7">
            <Button
              type="button"
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className="text-sm"
            >
              Back
            </Button>
            <Button type="button" variant="ghost" onClick={onSkip} className="text-sm">
              Skip
            </Button>
            <Button type="button" onClick={handlePrimaryAction} className="ml-auto text-sm">
              {step.primaryLabel ?? "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
