import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import InfoTooltip from "../../../components/ui/InfoTooltip.jsx";
import Input from "../../../components/ui/Input.jsx";
import { appMetadata } from "../../../app/appMetadata.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { financeConceptGroups, troubleshootingChecklist } from "../helpSupportData.js";

const categoryCards = [
  {
    title: "Quick start",
    helper: "Learn the basics",
    badge: "Beginner",
    icon: Rocket,
    tone: "bg-[#EAF2FF] text-[#1D4ED8]",
  },
  {
    title: "Billing workflows",
    helper: "Bills, cards, due dates",
    badge: "Workflow",
    icon: ClipboardList,
    tone: "bg-[#EAF7EF] text-[#15803D]",
  },
  {
    title: "Troubleshooting",
    helper: "Fix common issues",
    badge: "Help",
    icon: Wrench,
    tone: "bg-[#FFF4E5] text-[#B45309]",
  },
  {
    title: "Contact support",
    helper: "Get help from the team",
    badge: "Support",
    icon: MessageCircle,
    tone: "bg-[#EEF2FF] text-[#1E3A8A]",
  },
];

const suggestedTopics = [
  "Add a transaction",
  "Track bills",
  "Copy budgets",
  "Mark card paid",
  "Manage goals",
  "Cash Position",
  "Money Center",
];

const popularArticles = [
  {
    id: "getting-started",
    title: "Getting started with Spedger",
    description: "A quick overview to help you get up and running.",
    badge: "Getting started",
    detail:
      "Start with Overview for month snapshots, then set budgets, add recurring bills, and verify card payment settings so alerts stay accurate.",
    targetView: "dashboard",
  },
  {
    id: "monthly-budgets",
    title: "How monthly budgets work",
    description: "Understand budgets, categories, and spending limits.",
    badge: "Budgets",
    detail:
      "Budgets are monthly spending plans by category. Spending reduces Budget Remaining, while Cash Position comes from tracked account balances and movements.",
    targetView: "budgets",
  },
  {
    id: "card-payments",
    title: "How to track credit card payments",
    description: "Add cards, log payments, and stay on track.",
    badge: "Cards & Debt",
    detail:
      "Card purchases affect spending immediately, but Cash Position changes only when a card payment is recorded from a tracked account.",
    targetView: "credit-cards",
  },
  {
    id: "bill-due-dates",
    title: "How bill due dates are calculated",
    description: "See how Spedger estimates and updates due dates.",
    badge: "Bills",
    detail:
      "Due dates use template settings plus selected month context. Keep recurring templates current so due-soon alerts stay trustworthy.",
    targetView: "recurring",
  },
  {
    id: "savings-goals",
    title: "How savings goals and contributions work",
    description: "Set goals, contribute, and reach your milestones.",
    badge: "Goals",
    detail:
      "Savings goals track progress by target and contributions. They are planning tools and do not directly rewrite account snapshots.",
    targetView: "savings",
  },
  {
    id: "cash-position",
    title: "How Cash Position works",
    description: "Understand tracked accounts, snapshots, and money movement.",
    badge: "Money Center",
    detail:
      "Cash Position starts with tracked account snapshots, then applies tracked inflows/outflows like income deposits, spending, and bill/card payments.",
    targetView: "financial-position",
  },
];

const workflowGuides = [
  {
    id: "budget-review",
    title: "Monthly budget review",
    description: "Review spending, adjust budgets, and plan ahead.",
    time: "3 min",
    targetView: "budgets",
  },
  {
    id: "pay-bills",
    title: "Pay bills and mark cards paid",
    description: "Keep your bills and cards up to date.",
    time: "5 min",
    targetView: "recurring",
  },
  {
    id: "track-spending",
    title: "Track spending by category",
    description: "See where your money is going.",
    time: "4 min",
    targetView: "spending",
  },
  {
    id: "savings-setup",
    title: "Set up savings goals",
    description: "Create goals and automate contributions.",
    time: "4 min",
    targetView: "savings",
  },
  {
    id: "cash-position-update",
    title: "Update Cash Position",
    description: "Add account snapshots and tracked money movements.",
    time: "4 min",
    targetView: "financial-position",
  },
];

function includesQuery(text, query) {
  if (!query) return true;
  return String(text).toLowerCase().includes(query.toLowerCase());
}

function SearchTopicChip({ topic, onSelect }) {
  return (
    <button
      type="button"
      className="rounded-full border border-app-border bg-app-surface px-3 py-1.5 text-xs font-medium text-text-soft transition hover:border-brand-primary/40 hover:text-brand-primary"
      onClick={() => onSelect(topic)}
    >
      {topic}
    </button>
  );
}

export default function HelpSupport() {
  const [query, setQuery] = useState("");
  const [openArticleId, setOpenArticleId] = useState("");
  const [openGuideId, setOpenGuideId] = useState("");
  const [openConceptId, setOpenConceptId] = useState("");
  const workflowSectionRef = useRef(null);

  const filteredArticles = useMemo(
    () =>
      popularArticles.filter((article) =>
        includesQuery(
          `${article.title} ${article.description} ${article.badge} ${article.detail}`,
          query,
        ),
      ),
    [query],
  );

  const filteredGuides = useMemo(
    () =>
      workflowGuides.filter((guide) =>
        includesQuery(`${guide.title} ${guide.description} ${guide.time}`, query),
      ),
    [query],
  );

  const filteredConceptGroups = useMemo(
    () =>
      financeConceptGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            includesQuery(`${group.title} ${item.question} ${item.answer}`, query),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [query],
  );

  const troubleshootingMatches = useMemo(
    () => troubleshootingChecklist.filter((item) => includesQuery(item, query)),
    [query],
  );

  function handleContactSupport() {
    window.location.href = `mailto:${appMetadata.supportEmail}?subject=Spedger%20Support`;
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <p className="text-sm text-text-muted">
            Search guided answers, workflows, and troubleshooting without leaving your current
            household context.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryDark"
          onClick={handleContactSupport}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Contact support
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {categoryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${card.tone}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="rounded-full border border-app-border bg-app-surfaceSoft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-soft">
                  {card.badge}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold text-text-main">{card.title}</p>
              <p className="mt-1 text-sm text-text-muted">{card.helper}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-text-main">Search help center</h3>
              <InfoTooltip
                label="Search help center info"
                content="Use keywords to filter articles, workflow guides, concept answers, and troubleshooting tips in this page."
              />
            </div>
            <div className="mt-3 max-w-3xl">
              <Input
                label="Search help center"
                hideLabel
                aria-label="Search help center"
                placeholder="Search help articles, workflows, or questions"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <SearchTopicChip key={topic} topic={topic} onSelect={setQuery} />
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Popular articles</h3>
            </div>
            <div className="grid gap-1 p-3">
              {filteredArticles.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-surfaceSoft p-4 text-sm text-text-muted">
                  No articles match "{query}". Try a different search term.
                </p>
              ) : (
                filteredArticles.map((article) => {
                  const isOpen = openArticleId === article.id;
                  return (
                    <div
                      key={article.id}
                      className="rounded-xl border border-app-border bg-app-surface"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 p-3 text-left"
                        onClick={() => setOpenArticleId(isOpen ? "" : article.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-brand-primary">
                          <BookOpen size={16} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-main">{article.title}</p>
                          <p className="mt-0.5 text-xs text-text-muted">{article.description}</p>
                        </div>
                        <span className="rounded-full border border-app-border bg-app-surfaceSoft px-2 py-1 text-[11px] font-semibold text-text-soft">
                          {article.badge}
                        </span>
                        <ChevronRight size={16} className="text-text-muted" aria-hidden="true" />
                      </button>
                      {isOpen ? (
                        <div className="border-t border-app-border px-3 py-3">
                          <p className="text-sm text-text-muted">{article.detail}</p>
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                            onClick={() => dispatchNavigation(article.targetView)}
                          >
                            Open related page
                            <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card ref={workflowSectionRef} className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Workflow guides</h3>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {filteredGuides.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-surfaceSoft p-4 text-sm text-text-muted md:col-span-2">
                  No workflow guides match "{query}".
                </p>
              ) : (
                filteredGuides.map((guide) => {
                  const isOpen = openGuideId === guide.id;
                  return (
                    <article
                      key={guide.id}
                      className="rounded-xl border border-app-border bg-app-surface p-3"
                    >
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-3 text-left"
                        onClick={() => setOpenGuideId(isOpen ? "" : guide.id)}
                        aria-expanded={isOpen}
                      >
                        <div>
                          <p className="text-sm font-semibold text-text-main">{guide.title}</p>
                          <p className="mt-1 text-xs text-text-muted">{guide.description}</p>
                        </div>
                        <span className="rounded-full bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-brand-primary">
                          {guide.time}
                        </span>
                      </button>
                      {isOpen ? (
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                          onClick={() => dispatchNavigation(guide.targetView)}
                        >
                          Open workflow
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Spedger concept guide</h3>
              <p className="mt-1 text-sm text-text-muted">
                Keep these definitions handy when dashboard numbers or payment flows seem off.
              </p>
            </div>
            <div className="grid gap-3 p-4">
              {filteredConceptGroups.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-surfaceSoft p-4 text-sm text-text-muted">
                  No concept answers match "{query}".
                </p>
              ) : (
                filteredConceptGroups.map((group) => (
                  <section
                    key={group.title}
                    className="rounded-xl border border-app-border bg-app-surface"
                  >
                    <div className="border-b border-app-border px-4 py-3">
                      <p className="text-sm font-semibold text-text-main">{group.title}</p>
                    </div>
                    <div className="grid gap-1 p-2">
                      {group.items.map((item) => {
                        const conceptKey = `${group.title}:${item.question}`;
                        const isOpen = openConceptId === conceptKey;
                        return (
                          <div key={conceptKey} className="rounded-lg border border-app-border">
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                              onClick={() => setOpenConceptId(isOpen ? "" : conceptKey)}
                              aria-expanded={isOpen}
                            >
                              <span className="text-sm font-medium text-text-main">
                                {item.question}
                              </span>
                              <ChevronDown
                                size={15}
                                className={`text-text-muted transition ${isOpen ? "rotate-180" : ""}`}
                                aria-hidden="true"
                              />
                            </button>
                            {isOpen ? (
                              <p className="border-t border-app-border px-3 py-2 text-sm leading-6 text-text-muted">
                                {item.answer}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">If a number looks wrong</h3>
            </div>
            <div className="grid gap-2 p-4">
              {(query ? troubleshootingMatches : troubleshootingChecklist).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-2.5"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF7EF] text-status-successDark">
                    <CheckCircle2 size={14} aria-hidden="true" />
                  </span>
                  <p className="text-sm text-text-muted">{item}</p>
                </div>
              ))}
              {query && troubleshootingMatches.length === 0 ? (
                <p className="rounded-lg border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                  No troubleshooting checklist items match "{query}".
                </p>
              ) : null}
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Support status</h3>
              <p className="mt-1 text-xs text-text-muted">
                Guidance values shown here are support-policy placeholders.
              </p>
            </div>
            <div className="grid gap-3 p-4 text-sm">
              <RailStat label="Average response time" value="Within 4 hours" tone="good" />
              <RailStat label="Support availability" value="Mon-Fri, 8am-8pm ET" />
              <RailStat label="App status" value="All systems operational" tone="good" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Contact support</h3>
            </div>
            <div className="grid gap-2 p-4">
              <button
                type="button"
                className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface px-3 py-2 text-left hover:bg-app-surfaceSoft"
                onClick={handleContactSupport}
              >
                <span>
                  <p className="text-sm font-semibold text-text-main">Email support</p>
                  <p className="text-xs text-text-muted">Get help via email</p>
                </span>
                <ArrowRight size={15} className="text-text-muted" aria-hidden="true" />
              </button>

              <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2">
                <span>
                  <p className="text-sm font-semibold text-text-main">Submit a ticket</p>
                  <p className="text-xs text-text-muted">Coming soon</p>
                </span>
                <span className="rounded-full bg-app-muted px-2 py-1 text-[11px] font-semibold text-text-soft">
                  Soon
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2">
                <span>
                  <p className="text-sm font-semibold text-text-main">Send feedback</p>
                  <p className="text-xs text-text-muted">Coming soon</p>
                </span>
                <span className="rounded-full bg-app-muted px-2 py-1 text-[11px] font-semibold text-text-soft">
                  Soon
                </span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Release notes</h3>
            </div>
            <div className="p-4">
              <div className="rounded-xl border border-app-border bg-app-surface px-3 py-3">
                <p className="text-sm font-semibold text-text-main">What's new in Spedger</p>
                <p className="mt-1 text-xs text-text-muted">
                  Latest improvements, bug fixes, and workflow updates.
                </p>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                onClick={() => dispatchNavigation("release-notes")}
              >
                View all
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </Card>

          <Card className="border-status-warningBg bg-status-warningBg/35 p-5">
            <div className="flex items-center gap-2 text-status-warningDark">
              <Sparkles size={16} aria-hidden="true" />
              <p className="text-lg font-semibold text-text-main">Tip</p>
            </div>
            <p className="mt-2 text-sm text-text-soft">
              Review your bills and cards together at the start of each month.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
              onClick={() =>
                workflowSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              See monthly checklist
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function RailStat({ label, value, tone = "neutral" }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-text-muted">{label}</p>
      <p
        className={
          tone === "good" ? "font-semibold text-status-successDark" : "font-semibold text-text-main"
        }
      >
        {value}
      </p>
    </div>
  );
}
