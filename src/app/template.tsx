"use client";

import React from "react";
import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0.85, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.15,
        ease: "easeOut",
      }}
      className="flex-1 flex flex-col w-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
