export type ManifestoSegment = {
  text: string;
  accent?: boolean;
};

export const MANIFESTO_PARAGRAPHS: ManifestoSegment[][] = [
  [
    { text: "РАССВЕТ", accent: true },
    {
      text: " — это не просто мерч и не очередная попытка сделать громкий визуал ради продаж. В этот проект вложено много сил, времени и личного отношения: от идеи и формы до деталей, материалов и общей атмосферы.",
    },
  ],
  [
    { text: "Для нас важно создавать продукт, в котором есть " },
    { text: "смысл", accent: true },
    { text: ". " },
    { text: "РАССВЕТ", accent: true },
    {
      text: " вырос на стыке двух направлений: культуры людей ",
    },
    { text: "специального назначения", accent: true },
    {
      text: " — с их дисциплиной, собранностью, внутренним кодексом — и ",
    },
    { text: "андеграундной городской эстетики", accent: true },
    {
      text: ", где ценятся честность, характер и независимость.",
    },
  ],
  [
    { text: "Мы ", accent: false },
    { text: "не гонимся за деньгами", accent: true },
    {
      text: " и не пытаемся быть удобными для всех. Нам ближе путь, где вещь говорит за человека: спокойно, жёстко и без лишних объяснений. Каждый элемент проекта — это часть общей идеи, визуального языка и отношения к делу.",
    },
  ],
  [
    { text: "РАССВЕТ", accent: true },
    {
      text: " — для тех, кто понимает форму, уважает содержание и выбирает не случайный стиль, а ",
    },
    { text: "знак принадлежности", accent: true },
    { text: " к своему кругу." },
  ],
];

export type ManifestoWord = {
  word: string;
  accent: boolean;
  globalIndex: number;
};

function tokenizeSegment(
  segment: ManifestoSegment,
  globalIndex: number,
): { words: ManifestoWord[]; nextIndex: number } {
  const words: ManifestoWord[] = [];
  let nextIndex = globalIndex;
  const tokens = segment.text.trim().length
    ? segment.text.split(/(\s+)/).filter((part) => part.length > 0)
    : [];

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      words.push({ word: token, accent: false, globalIndex: -1 });
      continue;
    }
    words.push({
      word: token,
      accent: Boolean(segment.accent),
      globalIndex: nextIndex,
    });
    nextIndex += 1;
  }

  return { words, nextIndex };
}

export function buildManifestoParagraphWords(
  paragraphs: ManifestoSegment[][],
): ManifestoWord[][] {
  const result: ManifestoWord[][] = [];
  let globalIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords: ManifestoWord[] = [];
    for (const segment of paragraph) {
      const { words, nextIndex } = tokenizeSegment(segment, globalIndex);
      paragraphWords.push(...words);
      globalIndex = nextIndex;
    }
    result.push(paragraphWords);
  }

  return result;
}

export function countRevealWords(paragraphWords: ManifestoWord[][]): number {
  return paragraphWords.reduce(
    (sum, paragraph) => sum + paragraph.filter((w) => w.globalIndex >= 0).length,
    0,
  );
}
