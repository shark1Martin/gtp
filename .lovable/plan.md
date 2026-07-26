# Porsche Model Quiz

Build a client-side quiz that shows a Porsche photo and asks the user to pick the correct model from 4 options. Uses the "Motorsport Precision" direction as visual reference.

## Scope

- Single page at `/` (replaces the placeholder index).
- 10-question quiz session, pulled from a static bank of Porsche models with locally-generated hero images.
- Instant feedback per pick (correct = red highlight on chosen; wrong = red flash on chosen + green outline on correct answer).
- Score and progress in the sticky top bar.
- Final results screen with score, accuracy %, and Restart CTA.
- No backend, no persistence — pure frontend.

## Content: quiz bank

10 iconic Porsche models, each with 3 plausible distractors drawn from the same pool:
911 Carrera RS 2.7, 930 Turbo, 959, 964 Carrera RS, 993 GT2, 918 Spyder, Carrera GT, Cayman GT4, Taycan Turbo S, Panamera.

For each entry: generate one hero image (via `imagegen` at build-time-in-chat, saved under `src/assets/porsche-*.jpg`) that reads clearly as that specific model.

## Design (from selected direction)

- Palette tokens in `src/styles.css`: background `#0D0D0D`, foreground `#FFFFFF`, primary `#E30613`, muted white/40, border white/15. Add `--color-correct` (green) for post-answer feedback.
- Fonts: Anton (display), Inter (body), JetBrains Mono (labels). Loaded via `<link>` in `__root.tsx` head.
- Keep the exact composition: sticky top status bar (label + progress ticks + points), 2-col main grid (image hero + question copy on left; 4-option selection column on right), fixed bottom telemetry footer.
- Viewfinder corner accents on the image, "Frame N/10" overlay label.
- Answer buttons: numbered 01–04, Anton uppercase, hover border→primary, click snap animation, correct/wrong states as described.
- "Initialize Next Sequence" button appears only after answering.

## Structure

```text
src/routes/index.tsx        Quiz page (client state)
src/lib/quiz-data.ts        Model bank + question generator
src/assets/porsche-*.jpg    10 generated images (one per model)
src/styles.css              Add tokens: --primary red, --correct green
src/routes/__root.tsx       Add Anton / Inter / JetBrains Mono <link> tags; update head meta (title, description, og) for the quiz
```

## State (single component, useState)

- `questions`: shuffled array of 10 `{ model, image, options[4], correctIndex }`.
- `current`: 0..9.
- `selected`: index | null.
- `score`, `correctCount`.
- `phase`: `'answering' | 'revealed' | 'done'`.

Flow: click option → set `selected`, phase `revealed`, update score if correct → "Next" advances or transitions to `done`. `done` renders a results panel in the same shell (score / accuracy / restart).

## Head metadata

Set unique title + description + og:title/description on `/` (not root). Title: "Guess the Porsche — Model ID Quiz". No og:image (let hosting inject the screenshot).

## Out of scope

- Auth, database, leaderboards.
- Sound clips / hint system from the prototype (not in the user's ask).
- Difficulty selection.
