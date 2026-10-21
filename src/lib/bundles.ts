import { Skill } from "@/types/database";
import { normalizeSkillId } from "@/lib/catalog-data";

export interface SkillBundle {
  id: string;
  title: string;
  description: string;
  skillIds: string[];
}

export const BUNDLES: SkillBundle[] = [
  {
    id: "kitchen-basics",
    title: "Kitchen basics",
    description: "A sharp knife, a proper espresso and your own sourdough loaf.",
    skillIds: [
      "a3333333-3333-3333-3333-333333333333",
      "a5555555-5555-5555-5555-555555555555",
      "a7777777-7777-7777-7777-777777777777",
    ],
  },
  {
    id: "nimble-hands",
    title: "Nimble hands",
    description: "Fast, accurate fingers: typing, a speed-cube solve and a three-ball cascade.",
    skillIds: [
      "a4444444-4444-4444-4444-444444444444",
      "a6666666-6666-6666-6666-666666666666",
      "a8888888-8888-8888-8888-888888888888",
    ],
  },
  {
    id: "sound-and-script",
    title: "Sound and script",
    description: "Play your first fingerstyle pattern and read a new alphabet.",
    skillIds: [
      "a1111111-1111-1111-1111-111111111111",
      "a2222222-2222-2222-2222-222222222222",
    ],
  },
];

export function bundleSkills(bundle: SkillBundle, skills: Skill[]): Skill[] {
  const byId = new Map(skills.map((s) => [normalizeSkillId(s.id), s]));
  return bundle.skillIds.map((id) => byId.get(normalizeSkillId(id))).filter((s): s is Skill => !!s);
}
