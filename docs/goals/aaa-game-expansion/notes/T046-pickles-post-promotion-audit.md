# T046 Pickles Post-Promotion Audit

Decision: `fix_promotion`.

The Pickles Pugilist runtime promotion is not acceptable as complete yet, even though the promoted fighter rows are byte-identical to source and the targeted smoke proved `pugilist-pug` runtime sprite routing for idle, jump, light punch, and special.

## Blocking Issues

- When Pickles is selected as P1, the fight HUD still shows the static rabbit portrait. That creates a misleading cat/rabbit-only runtime state after a third playable fighter has been promoted.
- Tracked roster-lab artifacts still describe Pickles as a source-only identity lock. The source roster lab tests allowed that stale artifact truth to survive.

## Non-Blocking Findings

- No source/public Pickles row drift was found.
- The targeted runtime smoke did not show fighter fallback rows for Pickles.
- The broad AAA game outcome remains incomplete and should not be marked complete from this promotion.

## Required Follow-Up

Create T047 as a bounded Worker package to fix promotion truthfulness:

- Preserve Pickles sprite row size and pixel identity.
- Make the fight HUD truthfully represent Pickles when selected.
- Refresh roster-lab artifacts and tests so Pickles cannot be mislabeled source-only.
- Verify with cmp, asset QA, focused tests, full verify, and targeted browser smoke.
