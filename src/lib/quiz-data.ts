import carreraRs from "../assets/porsche-carrera-rs-27.jpg";
import turbo930 from "../assets/porsche-930-turbo.jpg";
import p959 from "../assets/porsche-959.jpg";
import rs964 from "../assets/porsche-964-rs.jpg";
import gt2993 from "../assets/porsche-993-gt2.jpg";
import spyder918 from "../assets/porsche-918-spyder.jpg";
import carreraGt from "../assets/porsche-carrera-gt.jpg";
import caymanGt4 from "../assets/porsche-cayman-gt4.jpg";
import taycan from "../assets/porsche-taycan.jpg";
import panamera from "../assets/porsche-panamera.jpg";

export type PorscheModel = {
  name: string;
  image: string;
  era: string;
};

export const MODELS: PorscheModel[] = [
  { name: "911 Carrera RS 2.7", image: carreraRs, era: "1973 · Air-cooled" },
  { name: "930 Turbo", image: turbo930, era: "1975 · Air-cooled" },
  { name: "959", image: p959, era: "1986 · Group B" },
  { name: "964 Carrera RS", image: rs964, era: "1992 · Air-cooled" },
  { name: "993 GT2", image: gt2993, era: "1995 · Air-cooled" },
  { name: "918 Spyder", image: spyder918, era: "2013 · Hybrid" },
  { name: "Carrera GT", image: carreraGt, era: "2004 · V10" },
  { name: "718 Cayman GT4", image: caymanGt4, era: "2019 · Mid-engine" },
  { name: "Taycan Turbo S", image: taycan, era: "2020 · Electric" },
  { name: "Panamera", image: panamera, era: "2016 · Grand Tourer" },
];

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

export function buildQuiz(count = 10): Question[] {
  const order = shuffle(MODELS).slice(0, count);
  return order.map((answer) => {
    const distractors = shuffle(MODELS.filter((m) => m.name !== answer.name)).slice(0, 3);
    const options = shuffle([answer, ...distractors]);
    return {
      answer,
      options,
      correctIndex: options.findIndex((o) => o.name === answer.name),
    };
  });
}