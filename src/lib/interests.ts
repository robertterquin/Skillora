export interface Interest {
  id: string;
  label: string;
  desc: string;
  categoryId: string;
  prompt: string;
}

export const INTERESTS: Interest[] = [
  {
    id: "music",
    label: "Music",
    desc: "Guitar, piano, rhythm",
    categoryId: "11111111-1111-1111-1111-111111111111",
    prompt: "I'd like to learn something musical. What would you suggest?",
  },
  {
    id: "languages",
    label: "Languages",
    desc: "Cyrillic, Italian, Hangul",
    categoryId: "22222222-2222-2222-2222-222222222222",
    prompt: "I'd like to start on a new language or alphabet. Where should I begin?",
  },
  {
    id: "crafts",
    label: "Crafts & life",
    desc: "Knives, espresso, cooking",
    categoryId: "33333333-3333-3333-3333-333333333333",
    prompt: "I'd like a hands-on skill for everyday life. What would you suggest?",
  },
  {
    id: "tech",
    label: "Tech",
    desc: "Typing, Git, terminal",
    categoryId: "44444444-4444-4444-4444-444444444444",
    prompt: "I'd like a practical tech skill. What would you suggest?",
  },
];

export function findInterest(id: string | null | undefined): Interest | undefined {
  return INTERESTS.find((i) => i.id === id);
}
