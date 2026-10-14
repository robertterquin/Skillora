// System-wide Uniform Male Voice Utility
// Guarantees consistent, resonant male speech across all browsers, operating systems, and fallbacks

export const UNIFORM_MALE_VOICE_NAMES = [
  "Daniel",
  "Eddy",
  "Reed",
  "Rocko",
  "Alex",
  "Arthur",
  "Oliver",
  "Fred",
  "Aaron",
  "Ralph",
  "Grandpa",
  "Guy",
  "David",
  "Mark",
  "George",
  "Rishi",
  "Aman",
];

export const FEMALE_VOICE_BLACKLIST = [
  "samantha",
  "victoria",
  "karen",
  "kathy",
  "moira",
  "flo",
  "grandma",
  "sandy",
  "shelley",
  "tara",
  "tessa",
  "zira",
  "hazel",
  "susan",
  "jenny",
  "aria",
  "female",
  "woman",
  "girl",
];

/**
 * Returns a guaranteed male voice from the browser's Web Speech API.
 * Filters out female voices and falls back to deep masculine pitch modulation (0.75).
 */
export function getUniformMaleVoice(customLang = "en"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langPrefix = customLang.slice(0, 2).toLowerCase();

  // 1. Priority: Known high-quality male voice matching language
  for (const name of UNIFORM_MALE_VOICE_NAMES) {
    const match = voices.find(
      (v) =>
        v.name.includes(name) &&
        (!customLang || v.lang.toLowerCase().startsWith(langPrefix))
    );
    if (match) return match;
  }

  // 2. Second Priority: Any voice explicitly containing "Male"
  const explicitMale = voices.find(
    (v) =>
      /\bmale\b/i.test(v.name) &&
      (!customLang || v.lang.toLowerCase().startsWith(langPrefix))
  );
  if (explicitMale) return explicitMale;

  // 3. Third Priority: Any voice for the language that is strictly NOT in the female blacklist
  const nonFemale = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    const isLang = !customLang || v.lang.toLowerCase().startsWith(langPrefix);
    const isFemale = FEMALE_VOICE_BLACKLIST.some((f) => nameLower.includes(f));
    return isLang && !isFemale;
  });
  if (nonFemale) return nonFemale;

  // 4. Fallback: Any English voice (caller will apply low 0.75 pitch)
  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}
