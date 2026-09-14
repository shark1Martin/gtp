export type CarAngle = "front" | "three-quarter" | "side" | "rear";

const ALL_ANGLES: CarAngle[] = ["front", "three-quarter", "side", "rear"];

export type PorscheModel = {
  id: string;
  name: string;
  /** Which angles have an image available for this model */
  angles: CarAngle[];
};

// Modern (2015+, pre-electric-transition) Porsche model lines, split by
// body style where the roofline is a real silhouette difference (911
// Carrera/Cabriolet/Targa, 718 Cayman/Boxster) — never by trim or engine
// badge alone (S, T, GT, 4, Turbo, etc).
export const MODELS: PorscheModel[] = [
  { id: "911-carrera", name: "911 Carrera", angles: ALL_ANGLES },
  { id: "911-cabriolet", name: "911 Cabriolet", angles: ALL_ANGLES },
  { id: "911-targa", name: "911 Targa", angles: ALL_ANGLES },
  { id: "718-cayman", name: "718 Cayman", angles: ALL_ANGLES },
  { id: "718-boxster", name: "718 Boxster", angles: ALL_ANGLES },
  { id: "panamera", name: "Panamera", angles: ALL_ANGLES },
  { id: "macan", name: "Macan", angles: ALL_ANGLES },
  { id: "cayenne", name: "Cayenne", angles: ALL_ANGLES },
  { id: "taycan", name: "Taycan", angles: ALL_ANGLES },
  { id: "918-spyder", name: "918 Spyder", angles: ALL_ANGLES },
];

// Tracks which angles currently have a real photo (vs. a placeholder) so
// getCarImagePath can resolve the right file extension.
const REAL_PHOTOS: Record<string, CarAngle[]> = {
  panamera: ALL_ANGLES,
  taycan: ALL_ANGLES,
  "718-cayman": ALL_ANGLES,
  "911-carrera": ALL_ANGLES,
  "911-cabriolet": ALL_ANGLES,
  "911-targa": ALL_ANGLES,
  "718-boxster": ALL_ANGLES,
  macan: ALL_ANGLES,
  cayenne: ALL_ANGLES,
  "918-spyder": ALL_ANGLES,
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

export type ImageCredit = {
  photographer: string;
  source: string;
  license: string;
};

// Attribution for real (non-placeholder) photos sourced from Wikimedia
// Commons or similar, keyed by "<modelId>/<angle>". Only photos listed here
// get a credit line in the UI — the original 3 launch photos (panamera/side,
// taycan/three-quarter, 718-cayman/three-quarter) predate this system and
// are intentionally left uncredited.
export const IMAGE_CREDITS: Record<string, ImageCredit> = {
  "911-carrera/front": {
    photographer: "Alexandre Prevot",
    source: "https://commons.wikimedia.org/wiki/File:Gray_Porsche_992_Carrera.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-carrera/three-quarter": {
    photographer: "Alexander Migl",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_992.2_coupes_IMG_4597.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-carrera/side": {
    photographer: "Alexandre Prevot",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_992_Carrera_(2).jpg",
    license: "CC BY-SA 4.0",
  },
  "911-carrera/rear": {
    photographer: "TTTNIS",
    source: "https://commons.wikimedia.org/wiki/File:2025_Porsche_911_Carrera_S_rear.jpg",
    license: "CC0 1.0",
  },
  "911-cabriolet/front": {
    photographer: "Vauxford",
    source:
      "https://commons.wikimedia.org/wiki/File:2020_Porsche_911_Carrera_S_Automatic_Convertible_3.0_Front.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-cabriolet/three-quarter": {
    photographer: "Calreyn88",
    source: "https://commons.wikimedia.org/wiki/File:2024_Porsche_911_992_Carrera_S.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-cabriolet/side": {
    photographer: "KarleHorn",
    source: "https://commons.wikimedia.org/wiki/File:P992_Cabrio_geschlossen.JPG",
    license: "CC BY-SA 4.0",
  },
  "911-cabriolet/rear": {
    photographer: "Vauxford",
    source:
      "https://commons.wikimedia.org/wiki/File:2020_Porsche_911_Carrera_S_Automatic_Convertible_3.0_Rear.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-targa/front": {
    photographer: "先従隗始",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_3BA-992NA2_911_Targa_4_(24010611193).jpg",
    license: "CC0 1.0",
  },
  "911-targa/three-quarter": {
    photographer: "Hugh Llewelyn",
    source: "https://commons.wikimedia.org/wiki/File:2023_Porsche_911_Targa.jpg",
    license: "CC BY-SA 4.0",
  },
  "911-targa/side": {
    photographer: "Calreyn88",
    source: "https://commons.wikimedia.org/wiki/File:2022_Porsche_911_Targa_4S_(27185).jpg",
    license: "CC BY-SA 4.0",
  },
  "911-targa/rear": {
    photographer: "先従隗始",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_3BA-992NA2_911_Targa_4_(24010611185).jpg",
    license: "CC0 1.0",
  },
  "718-boxster/front": {
    photographer: "HJUdall",
    source: "https://commons.wikimedia.org/wiki/File:17_Porsche_718_Boxster_Base.jpg",
    license: "CC0 1.0",
  },
  "718-boxster/three-quarter": {
    photographer: "MercurySable99",
    source: "https://commons.wikimedia.org/wiki/File:2018_Porsche_718_Boxster,_front_right,_08-17-2023.jpg",
    license: "CC BY-SA 4.0",
  },
  "718-boxster/side": {
    photographer: "Iain Cameron",
    source: "https://commons.wikimedia.org/wiki/File:At_Culduie_hamlet_-_Applecross_(1)_(47532539762).jpg",
    license: "CC BY 2.0",
  },
  "718-boxster/rear": {
    photographer: "Iain Cameron",
    source: "https://commons.wikimedia.org/wiki/File:At_Clachaig_Inn,_Glencoe_(1)_(47532541162).jpg",
    license: "CC BY 2.0",
  },
  "718-cayman/front": {
    photographer: "Calreyn88",
    source: "https://commons.wikimedia.org/wiki/File:2020_Porsche_718_Cayman_GT4_(23096).jpg",
    license: "CC BY-SA 4.0",
  },
  "718-cayman/side": {
    photographer: "Calreyn88",
    source: "https://commons.wikimedia.org/wiki/File:2016_Porsche_718_Cayman_GTS.jpg",
    license: "CC BY-SA 4.0",
  },
  "718-cayman/rear": {
    photographer: "Calreyn88",
    source: "https://commons.wikimedia.org/wiki/File:2018_Porsche_718_Cayman_2.jpg",
    license: "CC BY-SA 4.0",
  },
  "macan/front": {
    photographer: "メイド理世",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Macan_(front)_24_September_2024.jpg",
    license: "CC BY-SA 4.0",
  },
  "macan/three-quarter": {
    photographer: "Aos.1905",
    source:
      "https://commons.wikimedia.org/wiki/File:Porsche_Macan_(2020)_(front_three-quarter_view)_in_Osaka.jpg",
    license: "CC BY-SA 4.0",
  },
  "macan/side": {
    photographer: "Saschaporsche",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Macan_-_right_side.JPG",
    license: "CC BY-SA 3.0",
  },
  "macan/rear": {
    photographer: "メイド理世",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Macan_(rear)_24_September_2024.jpg",
    license: "CC BY-SA 4.0",
  },
  "cayenne/front": {
    photographer: "茅野ふたば",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Cayenne_Macau_front_view_(July_14,_2025).jpg",
    license: "CC BY-SA 4.0",
  },
  "cayenne/three-quarter": {
    photographer: "HJUdall",
    source: "https://commons.wikimedia.org/wiki/File:23_Porsche_Cayenne_Base.jpg",
    license: "CC0 1.0",
  },
  "cayenne/side": {
    photographer: "Grandmaster Huon",
    source: "https://commons.wikimedia.org/wiki/File:Grey_porsche_cayenne_12_40_37_493000.jpeg",
    license: "CC BY-SA 4.0",
  },
  "cayenne/rear": {
    photographer: "茅野ふたば",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Cayenne_Macau_rear_view_(July_14,_2025).jpg",
    license: "CC BY-SA 4.0",
  },
  "918-spyder/front": {
    photographer: "Ethan Llamas",
    source: "https://commons.wikimedia.org/wiki/File:2015_Porsche_918_Spyder,_front_right,_06-08-2024.jpg",
    license: "CC BY-SA 4.0",
  },
  "918-spyder/three-quarter": {
    photographer: "Ethan Llamas",
    source: "https://commons.wikimedia.org/wiki/File:2015_Porsche_918_Spyder,_front_left,_06-08-2024.jpg",
    license: "CC BY-SA 4.0",
  },
  "918-spyder/side": {
    photographer: "Benoit cars",
    source: "https://commons.wikimedia.org/wiki/File:918_side_(14374138534).jpg",
    license: "CC BY-SA 2.0",
  },
  "918-spyder/rear": {
    photographer: "Ethan Llamas",
    source: "https://commons.wikimedia.org/wiki/File:2015_Porsche_918_Spyder,_rear_right,_06-08-2024.jpg",
    license: "CC BY-SA 4.0",
  },
  "panamera/front": {
    photographer: "Retired electrician",
    source: "https://commons.wikimedia.org/wiki/File:Moscow,_Porsche_Panamera_Aug_2025_03.jpg",
    license: "CC0 1.0",
  },
  "panamera/three-quarter": {
    photographer: "OWS Photography",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Panamera_(971)_Washington_DC_Metro_Area,_USA.jpg",
    license: "CC BY 4.0",
  },
  "panamera/rear": {
    photographer: "Retired electrician",
    source: "https://commons.wikimedia.org/wiki/File:Moscow,_Porsche_Panamera_Aug_2025_01.jpg",
    license: "CC0 1.0",
  },
  "taycan/front": {
    photographer: "OWS Photography",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Taycan_Washington_DC_Metro_Area,_USA.jpg",
    license: "CC BY 4.0",
  },
  "taycan/side": {
    photographer: "HJUdall",
    source: "https://commons.wikimedia.org/wiki/File:22_Porsche_Taycan_Base.jpg",
    license: "CC0 1.0",
  },
  "taycan/rear": {
    photographer: "Ethan Llamas",
    source: "https://commons.wikimedia.org/wiki/File:Porsche_Taycan_Dolomite_Silver_Metallic_02.jpg",
    license: "CC BY-SA 4.0",
  },
};

export function getImageCredit(modelId: string, angle: CarAngle): ImageCredit | undefined {
  return IMAGE_CREDITS[`${modelId}/${angle}`];
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

// One round per model line — no repeats.
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
