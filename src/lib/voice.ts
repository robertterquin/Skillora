import { authedFetch } from "@/lib/authed-fetch";

export const UNIFORM_MALE_VOICE_NAMES = [
  "Daniel",
  "Alex",
  "Fred",
  "Aaron",
  "Arthur",
  "Oliver",
  "Reed",
  "Rocko",
  "Eddy",
  "Ralph",
  "Grandpa",
  "Albert",
  "Junior",
  "Guy",
  "David",
  "Mark",
  "George",
  "Rishi",
  "Aman",
  "Google UK English Male",
  "Yuri",
  "Pavel",
  "Maxim",
  "Dmitri",
  "Jorge",
  "Diego",
  "Juan",
  "Carlos",
  "Thomas",
  "Nicolas",
  "Henri",
  "Martin",
  "Stefan",
  "Markus",
  "Luca",
  "Cosimo",
  "Otoya",
  "Hattori",
  "Ichiro",
  "Xander",
  "Maged",
  "Tarik",
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
  "allison",
  "ava",
  "nicky",
  "zoe",
  "fiona",
  "serena",
  "siri",
  "milena",
  "katya",
  "irina",
  "svetlana",
  "paulina",
  "monica",
  "luciana",
  "francisca",
  "amelie",
  "aurelie",
  "audrey",
  "chantal",
  "anna",
  "helena",
  "petra",
  "marlene",
  "alice",
  "federica",
  "joana",
  "catarina",
  "kyoko",
  "o-ren",
  "haruka",
  "ayumi",
  "sayaka",
  "ting-ting",
  "sin-ji",
  "mei-jia",
  "yuna",
  "lekha",
  "veena",
  "kanya",
  "damayanti",
  "ellen",
  "laura",
  "mariska",
  "melina",
  "nora",
  "satu",
  "yelda",
  "zosia",
  "carmit",
  "google us english",
  "google uk english female",
  "google русский",
  "google español",
  "google français",
  "google deutsch",
  "google italiano",
  "google 日本語",
  "google 한국의",
  "google 普通话",
  "google português",
  "female",
  "woman",
  "girl",
];

const ttsAudioUrlCache = new Map<string, string>();
let activeAudioElement: HTMLAudioElement | null = null;

export function getUniformMaleVoice(customLang = "en"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langPrefix = customLang.slice(0, 2).toLowerCase();

  for (const name of UNIFORM_MALE_VOICE_NAMES) {
    const match = voices.find(
      (v) =>
        v.name.toLowerCase().includes(name.toLowerCase()) &&
        v.lang.toLowerCase().startsWith(langPrefix) &&
        !FEMALE_VOICE_BLACKLIST.some((f) => v.name.toLowerCase().includes(f))
    );
    if (match) return match;
  }

  const explicitMale = voices.find(
    (v) =>
      /\bmale\b/i.test(v.name) &&
      v.lang.toLowerCase().startsWith(langPrefix) &&
      !FEMALE_VOICE_BLACKLIST.some((f) => v.name.toLowerCase().includes(f))
  );
  if (explicitMale) return explicitMale;

  for (const name of UNIFORM_MALE_VOICE_NAMES) {
    const match = voices.find(
      (v) =>
        v.name.toLowerCase().includes(name.toLowerCase()) &&
        v.lang.toLowerCase().startsWith("en") &&
        !FEMALE_VOICE_BLACKLIST.some((f) => v.name.toLowerCase().includes(f))
    );
    if (match) return match;
  }

  const safeNonFemale = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    const isFemale = FEMALE_VOICE_BLACKLIST.some((f) => nameLower.includes(f));
    const isGenericGoogleFemale = nameLower.startsWith("google ") && !nameLower.includes("male");
    return !isFemale && !isGenericGoogleFemale;
  });

  return safeNonFemale || null;
}

export function stopUniformVoice(): void {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakWithUniformMaleVoice(
  text: string,
  options?: {
    lang?: string;
    speed?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  if (typeof window === "undefined" || !text.trim()) {
    options?.onEnd?.();
    return;
  }

  stopUniformVoice();
  const cleanText = text.trim();
  const speed = options?.speed ?? 0.95;

  const runBrowserFallback = () => {
    if (!("speechSynthesis" in window)) {
      options?.onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const maleVoice = getUniformMaleVoice(options?.lang || "en-US");

    if (maleVoice) {
      utterance.voice = maleVoice;
      utterance.lang = maleVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.9;
    utterance.pitch = 0.72;
    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => options?.onEnd?.();
    utterance.onerror = () => options?.onEnd?.();
    window.speechSynthesis.speak(utterance);
  };

  const play = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    activeAudioElement = audio;
    options?.onStart?.();

    audio.onplay = () => options?.onStart?.();
    audio.onended = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      options?.onEnd?.();
    };
    audio.onpause = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      options?.onEnd?.();
    };
    audio.onerror = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      runBrowserFallback();
    };

    audio.play().catch(() => {
      if (activeAudioElement === audio) activeAudioElement = null;
      runBrowserFallback();
    });
  };

  const cacheKey = `${speed}:${cleanText}`;
  const cached = ttsAudioUrlCache.get(cacheKey);
  if (cached) {
    play(cached);
    return;
  }

  authedFetch(`/api/ai/tts?text=${encodeURIComponent(cleanText)}&voice=onyx&speed=${speed}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const url = URL.createObjectURL(await res.blob());
      ttsAudioUrlCache.set(cacheKey, url);
      play(url);
    })
    .catch(() => runBrowserFallback());
}

