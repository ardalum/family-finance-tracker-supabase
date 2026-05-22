import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const appSource = readFileSync("src/app/App.jsx", "utf8");
const walkthroughSource = readFileSync(
  "src/features/onboarding/components/OnboardingWalkthrough.jsx",
  "utf8",
);
const helpSupportSource = readFileSync("src/features/support/components/HelpSupport.jsx", "utf8");
const appSettingsSource = readFileSync("src/features/settings/components/AppSettings.jsx", "utf8");

test("onboarding does not auto-open by default and opens only after setup completion session flag", () => {
  assert.match(
    appSource,
    /const \[setupJustCompleted, setSetupJustCompleted\] = useState\(false\);/,
  );
  assert.match(appSource, /const \[onboardingOpen, setOnboardingOpen\] = useState\(false\);/);
  assert.match(
    appSource,
    /if \(!setupJustCompleted \|\| !activeHousehold\?\.setupComplete \|\| !activeHouseholdId\) return;/,
  );
  assert.match(appSource, /if \(hasCompletedOrDismissedOnboarding\(activeHouseholdId\)\)/);
  assert.match(appSource, /setOnboardingOpen\(true\);/);
  assert.match(appSource, /setSetupJustCompleted\(true\);/);
});

test("onboarding skip and finish close modal and persist local storage status", () => {
  assert.match(appSource, /writeOnboardingState\(activeHouseholdId, "dismissed"\);/);
  assert.match(appSource, /writeOnboardingState\(activeHouseholdId, "completed"\);/);
  assert.match(appSource, /onSkip=\{handleSkipOnboarding\}/);
  assert.match(appSource, /onFinish=\{handleFinishOnboarding\}/);
});

test("walkthrough includes required step titles, controls, and navigation actions", () => {
  assert.match(walkthroughSource, /Welcome to Spedger/);
  assert.match(walkthroughSource, /Start with Money Center/);
  assert.match(walkthroughSource, /Add transactions/);
  assert.match(walkthroughSource, /Plan your monthly budget/);
  assert.match(walkthroughSource, /Track bills and cards/);
  assert.match(walkthroughSource, /Review goals and insights/);
  assert.match(walkthroughSource, /You are ready/);
  assert.match(walkthroughSource, /Open Money Center/);
  assert.match(walkthroughSource, /Open Transactions/);
  assert.match(walkthroughSource, /Open Budgets/);
  assert.match(walkthroughSource, /Open Bills/);
  assert.match(walkthroughSource, /Open Cards & Debt/);
  assert.match(walkthroughSource, /Open Goals/);
  assert.match(walkthroughSource, /Open Insights/);
  assert.match(walkthroughSource, /Back/);
  assert.match(walkthroughSource, /Skip/);
  assert.match(walkthroughSource, /Finish/);
  assert.match(walkthroughSource, /aria-label="Close walkthrough"/);
  assert.match(walkthroughSource, /Step \{stepIndex \+ 1\} of \{totalSteps\}/);
  assert.match(walkthroughSource, /window\.addEventListener\("keydown", handleEscClose\)/);
  assert.match(walkthroughSource, /onNavigate\?\.\(action\.view\)/);
});

test("restart walkthrough action exists in help center and settings", () => {
  assert.match(helpSupportSource, /onRestartOnboarding/);
  assert.match(helpSupportSource, /Restart walkthrough/);
  assert.match(appSettingsSource, /onRestartOnboarding/);
  assert.match(appSettingsSource, /Review the main Spedger workflows again\./);
});
