# Car photos

How to add your own photos, and how to add a brand-new model to the quiz.

## How it works

Each model has its own folder here: `public/cars/<model-id>/`. Inside, photo
files are named by which of the 4 fixed angles they show. You can drop in
**more than one photo per angle** — every time that angle is shown in the
quiz, one of them is picked at random, so the same model doesn't always show
the same shot.

A generated file, `src/lib/car-photos.generated.json`, lists which photos
exist for each model/angle. It's rebuilt automatically:

- every time you run `npm run dev` or `npm run build`
- any time by running `npm run generate:cars`

**If the dev server is already running** when you add photos, it won't pick
them up until you either restart it or run `npm run generate:cars` yourself
(then just refresh the page — no restart needed after a manual run).

## Naming convention

```
public/cars/<model-id>/<angle>.<ext>
public/cars/<model-id>/<angle>-2.<ext>
public/cars/<model-id>/<angle>-3.<ext>
...
```

- **`<angle>`** — exactly one of: `front`, `three-quarter`, `side`, `rear`
  (`back` is accepted as a synonym for `rear`)
- **`<ext>`** — `jpg`, `jpeg`, `png`, `webp`, or `avif`
- The **first** photo of an angle has no number: `side.jpg`
- Each **additional** photo of the same angle gets `-2`, `-3`, etc.:
  `side-2.jpg`, `side-3.jpg`
- Numbers don't need to be contiguous and files don't need to be renamed
  when you add more — just pick the next unused number for that angle

Example — a `911-carrera` folder with 3 side shots and 1 of everything else:

```
public/cars/911-carrera/
  front.jpg
  three-quarter.jpg
  side.jpg
  side-2.jpg
  side-3.jpg
  rear.jpg
```

Filenames are otherwise up to you — only the `<angle>[-<n>].<ext>` part at
the end matters; anything that doesn't match that pattern is ignored by the
manifest generator (so junk like `.DS_Store` or a stray screenshot is safe
to leave in the folder, it's just never picked).

### Photo guidelines

- **Size**: resize so the longest edge is around 1600px, and compress to
  JPEG quality ~80–85. Aim for roughly 200–600KB per photo — full-resolution
  camera photos (several MB, 4000px+) work but bloat page load for no
  visible benefit at the size these render on screen.
- **Framing**: the car should be the clear subject, filling most of the
  frame, so its silhouette is easy to read at a glance.
- **Background**: keep it reasonably clean — a driveway or parking lot is
  fine; try to avoid other cars of the *same* model line in frame (it can
  make the silhouette harder to judge) and avoid identifiable people.

## Attribution (optional)

If a photo isn't yours — sourced from Wikimedia Commons or similar — add a
credit in `src/lib/quiz-data.ts`'s `IMAGE_CREDITS` map, keyed by
`"<model-id>/<filename>"` (the exact filename, not just the angle):

```ts
"911-carrera/side.jpg": {
  photographer: "Alexandre Prevot",
  source: "https://commons.wikimedia.org/wiki/File:Porsche_992_Carrera_(2).jpg",
  license: "CC BY-SA 4.0",
},
```

This shows a small "Photo: {photographer} · {license}" credit, linked to
`source`, in the corner of the image. **Your own photos don't need an
entry** — no entry just means no credit line is shown, which is correct for
a photo you took yourself.

Only use photos you own or that are under a license permitting reuse (e.g.
Wikimedia Commons' CC-licensed photos). Check the specific license terms —
most require attribution (which the credit entry above provides) and some
require share-alike.

## Adding photos to an existing model

1. Drop your photo(s) into `public/cars/<model-id>/`, following the naming
   convention above (use `-2`, `-3`, etc. if that angle already has a photo).
2. Restart `npm run dev` (or run `npm run generate:cars` and refresh).
3. Play through the quiz until that model comes up, and cycle its angles
   with the arrow buttons to check the new photo(s) look right.

## Adding a brand-new model (example: 911 Turbo)

1. **Pick an id.** Kebab-case, matches how you'll name the folder:
   `911-turbo`.

2. **Create the folder and add photos.**
   ```
   public/cars/911-turbo/
     front.jpg
     three-quarter.jpg
     side.jpg
     rear.jpg
   ```
   Add at least one photo per angle before enabling the model in step 3 —
   an angle with zero photos falls back to a "PLACEHOLDER" SVG card if one
   exists at `public/cars/911-turbo/<angle>.svg`, or shows a broken image
   if neither exists.

3. **Register the model** in `src/lib/quiz-data.ts`, in the `MODELS` array:
   ```ts
   export const MODELS: PorscheModel[] = [
     { id: "911-carrera", name: "911 Carrera", angles: ALL_ANGLES },
     // ...
     { id: "911-turbo", name: "911 Turbo", angles: ALL_ANGLES },
   ];
   ```
   The `name` is what's shown as an answer choice in the quiz.

4. **(Optional) add attribution** in `IMAGE_CREDITS` for any photo that
   isn't your own — see [Attribution](#attribution-optional) above.

5. **Regenerate and check.** Restart `npm run dev` (or run
   `npm run generate:cars`), then play the quiz — the new model now appears
   as a round and as a distractor option for other rounds.

That's it — no other files need to change. The quiz automatically scales
its round count and distractor pool to however many models are in `MODELS`.
