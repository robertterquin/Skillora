"use client";

import React, { useState } from "react";
import { playMechanicalClick } from "@/lib/workbench-audio";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { SimulatorFrame } from "./SimulatorFrame";

interface Letter {
  char: string;
  sound: string;
  anchor: string;
  word: string;
}

const LETTER_GROUPS: { name: string; note: string; letters: Letter[] }[] = [
  {
    name: "True friends",
    note: "Same look, same sound",
    letters: [
      { char: "А", sound: "A", anchor: "Open 'ah' like Father", word: "АКУЛА (Shark)" },
      { char: "К", sound: "K", anchor: "Crisp 'k' like Kite", word: "КОТ (Cat)" },
      { char: "М", sound: "M", anchor: "Clear 'm' like Mother", word: "МАМА (Mom)" },
      { char: "О", sound: "O", anchor: "Round 'o' like Open", word: "ОКНО (Window)" },
      { char: "Т", sound: "T", anchor: "Sharp 't' like Table", word: "ТОМ (Volume)" },
    ],
  },
  {
    name: "False friends",
    note: "Look Latin, sound different",
    letters: [
      { char: "В", sound: "V", anchor: "Looks like B, sounds like V (Victory)", word: "ВОДА (Water)" },
      { char: "Н", sound: "N", anchor: "Looks like H, sounds like N (No)", word: "НЕТ (No)" },
      { char: "Р", sound: "R", anchor: "Looks like P, sounds like rolled R", word: "РЕКА (River)" },
      { char: "С", sound: "S", anchor: "Looks like C, sounds like S (Sun)", word: "СЫР (Cheese)" },
      { char: "У", sound: "OO", anchor: "Looks like Y, sounds like OO (Moon)", word: "УТРО (Morning)" },
      { char: "Х", sound: "KH", anchor: "Looks like X, throaty H (Bach)", word: "ХЛЕБ (Bread)" },
    ],
  },
  {
    name: "Greek roots",
    note: "Distinctive shapes",
    letters: [
      { char: "Д", sound: "D", anchor: "Greek Delta → English D", word: "ДОМ (House)" },
      { char: "Г", sound: "G", anchor: "Greek Gamma → English G (Go)", word: "ГОРОД (City)" },
      { char: "П", sound: "P", anchor: "Greek Pi → English P (Park)", word: "ПАРК (Park)" },
      { char: "Ж", sound: "ZH", anchor: "Buzzing sibilant like Treasure", word: "ЖУК (Beetle)" },
      { char: "Ш", sound: "SH", anchor: "Three-pronged hush like Ship", word: "ШКОЛА (School)" },
    ],
  },
];

const spokenSample = (letter: Letter) => `${letter.char}. ${letter.word.split(" ")[0]}`;

export function PhoneticSoundboard({
  onSpeak,
  accentClass,
}: {
  onSpeak: (text: string, lang?: string) => void;
  accentClass?: string;
}) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>({
    char: "А",
    sound: "A (like Father)",
    anchor: "Identical to Latin 'A'",
    word: "АКУЛА (Shark)",
  });

  const handleTileClick = (letter: Letter) => {
    playMechanicalClick();
    setSelectedLetter(letter);
    onSpeak(spokenSample(letter), "ru-RU");
  };

  return (
    <SimulatorFrame icon="volume-loud-linear" title="Sound board" meta="Tap a letter to hear it" accentClass={accentClass}>
      <div className="space-y-4">
        {LETTER_GROUPS.map((group) => (
          <div key={group.name}>
            <div className="flex items-baseline justify-between gap-2 mb-1.5 text-xs">
              <span className="font-semibold text-ink-secondary">{group.name}</span>
              <span className="text-ink-muted">{group.note}</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {group.letters.map((l) => {
                const isSelected = selectedLetter?.char === l.char;
                return (
                  <button
                    key={l.char}
                    type="button"
                    onClick={() => handleTileClick(l)}
                    aria-pressed={isSelected}
                    aria-label={`${l.char}, sounds like ${l.sound}`}
                    className={cn(
                      "py-2 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer active:scale-95",
                      isSelected
                        ? "bg-ink text-white border-ink"
                        : "bg-canvas border-surface-border text-ink hover:border-ink/30 hover:bg-surface-subtle"
                    )}
                  >
                    <span className="font-display font-bold text-lg leading-tight">{l.char}</span>
                    <span className={cn("text-xs", isSelected ? "text-white/75" : "text-ink-muted")}>/{l.sound}/</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedLetter && (
        <div className="mt-4 p-3.5 rounded-xl bg-canvas border border-surface-border flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl text-ink">{selectedLetter.char}</span>
              <span className="text-sm font-semibold text-ink">/{selectedLetter.sound}/</span>
            </div>
            <p className="text-sm text-ink-secondary mt-0.5">
              {selectedLetter.anchor} · for example <strong className="font-semibold text-ink">{selectedLetter.word}</strong>
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSpeak(spokenSample(selectedLetter), "ru-RU")}
            title="Hear it again"
          >
            <AppIcon name="volume-loud-linear" className="w-3.5 h-3.5" />
            <span>Replay</span>
          </Button>
        </div>
      )}
    </SimulatorFrame>
  );
}
