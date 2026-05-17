import { BarChart3, CreditCard, ListChecks, ReceiptText } from "lucide-react";

export const creditCardSections = [
  {
    id: "overview",
    label: "Overview",
    description: "Quick totals and balance trend.",
    icon: BarChart3,
  },
  {
    id: "monthly-balances",
    label: "Monthly Balances",
    description: "Enter balances and mark cards paid.",
    icon: ListChecks,
  },
  {
    id: "statement-details",
    label: "Statement Details",
    description: "Track paid amount, minimum payment, autopay, and confirmation details.",
    icon: ReceiptText,
  },
  {
    id: "card-list",
    label: "Card List",
    description: "Add, edit, deactivate, or delete cards.",
    icon: CreditCard,
  },
];
