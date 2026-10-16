"use client";

import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

interface UserAvatarProps {
  seed: string;
  name?: string;
  size?: number;
  className?: string;
}

const MALE_HAIR: any[] = [
  "variant03", "variant04", "variant06", "variant12",
  "variant15", "variant27", "variant29", "variant33",
  "variant35", "variant38", "variant44", "variant54",
  "variant56", "hat"
];

const FEMALE_HAIR: any[] = [
  "variant01", "variant02", "variant05", "variant07",
  "variant08", "variant09", "variant10", "variant11",
  "variant13", "variant14", "variant16", "variant17",
  "variant18", "variant19", "variant20", "variant21",
  "variant22", "variant23", "variant24", "variant25",
  "variant26", "variant28", "variant30", "variant31",
  "variant32", "variant34", "variant36", "variant37",
  "variant39", "variant40", "variant41", "variant42",
  "variant43", "variant45", "variant46", "variant47",
  "variant48", "variant49", "variant50", "variant51",
  "variant52", "variant53", "variant55", "variant57",
  "variant58", "variant59", "variant60", "variant61",
  "variant62", "variant63"
];

const FEMALE_NAMES = new Set([
  "rosel", "maria", "mary", "sarah", "sara", "emily", "emma", "jessica", "jennifer",
  "lisa", "anna", "anne", "hannah", "elizabeth", "laura", "clara", "grace", "sophia",
  "sofia", "isabella", "charlotte", "amelia", "mia", "harper", "evelyn", "abigail",
  "ella", "elena", "chloe", "victoria", "rachel", "amanda", "nicole", "stephanie",
  "rebecca", "samantha", "megan", "katherine", "katie", "amy", "angela", "melissa",
  "michelle", "julia", "julie", "diana", "natalie", "vanessa", "jasmine", "rose",
  "rosa", "lucy", "lily", "patricia", "linda", "barbara", "susan", "karen", "nancy",
  "betty", "margaret", "sandra", "ashley", "kimberly", "donna", "carol", "dorothy",
  "deborah", "sharon", "cynthia", "kathleen", "shirley", "brenda", "pamela", "helen",
  "christine", "debra", "carolyn", "janet", "catherine", "heather", "diane", "virginia",
  "joyce", "kelly", "christina", "joan", "lauren", "judith", "cheryl", "andrea",
  "martha", "jacqueline", "frances", "gloria", "ann", "teresa", "kathryn", "janice",
  "jean", "alice", "madison", "doris", "judy", "denise", "amber", "marilyn", "beverly",
  "danielle", "theresia", "marie", "brittany"
]);

const MALE_NAMES = new Set([
  "robert", "terquin", "john", "james", "michael", "david", "william", "richard", "joseph",
  "thomas", "charles", "christopher", "daniel", "matthew", "anthony", "mark", "donald",
  "steven", "paul", "andrew", "joshua", "kenneth", "kevin", "brian", "george", "edward",
  "ronald", "timothy", "jason", "jeffrey", "ryan", "jacob", "gary", "nicholas", "eric",
  "jonathan", "stephen", "larry", "justin", "scott", "brandon", "benjamin", "samuel",
  "gregory", "alexander", "alex", "frank", "patrick", "raymond", "jack", "dennis", "jerry",
  "tyler", "aaron", "jose", "adam", "nathan", "henry", "douglas", "zachary", "peter", "kyle",
  "walter", "harold", "jeremy", "ethan", "carl", "keith", "roger", "gerald", "christian",
  "terry", "sean", "arthur", "austin", "noah", "lawrence", "jesse", "joe", "bryan", "billy",
  "jordan", "albert", "dylan", "bruce", "willie", "gabriel", "logan", "alan", "juan", "wayne",
  "roy", "ralph", "randy", "eugene", "vincent", "russell", "louis", "philip", "bobby", "johnny",
  "bradley"
]);

function inferGender(name?: string, seed?: string): "male" | "female" {
  const combined = `${name || ""} ${seed || ""}`.toLowerCase().replace(/@.*/, "").replace(/[^a-z\s]/g, " ");
  const tokens = combined.split(/\s+/).filter(Boolean);

  for (const t of tokens) {
    if (FEMALE_NAMES.has(t)) return "female";
    if (MALE_NAMES.has(t)) return "male";
  }

  const primary = tokens[0] || "";
  if (primary.endsWith("ette") || primary.endsWith("elle") || primary.endsWith("ina") || primary.endsWith("lyn")) {
    return "female";
  }
  if (primary.endsWith("a") && primary !== "joshua" && primary !== "luca") {
    return "female";
  }

  return "male";
}

export function UserAvatar({ seed, name, size = 36, className = "" }: UserAvatarProps) {
  const avatarDataUri = useMemo(() => {
    const gender = inferGender(name, seed);
    const isFemale = gender === "female";

    try {
      const avatar = createAvatar(notionists, {
        seed: seed || "SkilloraLearner",
        hair: isFemale ? FEMALE_HAIR : MALE_HAIR,
        beardProbability: isFemale ? 0 : 20,
        backgroundColor: ["EFECE4", "F1EDE4", "E8E4DA", "F7F5F0"],
      });
      return avatar.toDataUri();
    } catch {
      return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed || "Skillora")}`;
    }
  }, [seed, name]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full overflow-hidden border border-surface-border bg-white flex items-center justify-center flex-shrink-0 shadow-2xs ${className}`}
    >
      <img
        src={avatarDataUri}
        alt={`${name || seed}'s Avatar`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
