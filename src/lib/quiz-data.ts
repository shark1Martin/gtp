export type CarAngle = "front" | "three-quarter" | "side" | "rear";

const ALL_ANGLES: CarAngle[] = ["front", "three-quarter", "side", "rear"];

export type PorscheModel = {
  id: string;
  name: string;
  /** Which angles have an image available for this model */
  angles: CarAngle[];
};

// Modern Porsche model lines only — identified purely by body shape/silhouette,
// never by trim or engine badge (S, T, GT, 4, Turbo, etc).
export const MODELS: PorscheModel[] = [
  { id: "911", name: "911", angles: ALL_ANGLES },
  { id: "718-cayman-boxster", name: "718 Cayman / Boxster", angles: ALL_ANGLES },
  { id: "panamera", name: "Panamera", angles: ALL_ANGLES },
  { id: "macan", name: "Macan", angles: ALL_ANGLES },
  { id: "cayenne", name: "Cayenne", angles: ALL_ANGLES },
  { id: "taycan", name: "Taycan", angles: ALL_ANGLES },
];

// Tracks which angles currently have a real photo (vs. a placeholder) so
// getCarImagePath can resolve the right file extension.
const REAL_PHOTOS: Record<string, CarAngle[]> = {
  panamera: ["side"],
  taycan: ["three-quarter"],
  "718-cayman-boxster": ["three-quarter"],
};

/**
 * Path to a model's image for a given angle. Real photos live directly in
 * /public/cars/<id>/; placeholders use the same path with a .svg extension.
 * Drop a matching .jpg/.png in the same folder to replace a placeholder —
 * no code changes needed.
 */
export function getCarImagePath(modelId: string, angle: CarAngle): string {
  const extension = REAL_PHOTOS[modelId]?.includes(angle) ? "jpg" : "svg";
  return `/cars/${modelId}/${angle}.${extension}`;
}

export type Question = {
  answer: PorscheModel;
  options: PorscheModel[];
  correctIndex: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One round per model line — no repeats, since there are only 6 model lines
// in scope right now.
export function buildQuiz(count = MODELS.length): Question[] {
  const order = shuffle(MODELS).slice(0, count);
  return order.map((answer) => {
    const distractors = shuffle(MODELS.filter((m) => m.id !== answer.id)).slice(0, 3);
    const options = shuffle([answer, ...distractors]);
    return {
      answer,
      options,
      correctIndex: options.findIndex((o) => o.id === answer.id),
    };
  });
}
