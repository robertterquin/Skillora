"use client";

import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";

interface UserAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ seed, size = 36, className = "" }: UserAvatarProps) {
  const avatarDataUri = useMemo(() => {
    try {
      const avatar = createAvatar(bigSmile, {
        seed: seed || "SkilloraLearner",
        flip: false,
        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      });
      return avatar.toDataUri();
    } catch (e) {
      // Fallback to DiceBear CDN if anything fails
      return `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(seed || "Skillora")}`;
    }
  }, [seed]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full overflow-hidden border border-surface-border bg-white flex items-center justify-center flex-shrink-0 shadow-2xs ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarDataUri}
        alt={`${seed}'s Avatar`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
