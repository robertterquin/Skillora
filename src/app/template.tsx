"use client";

import React from "react";
import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1], // Crisp Swiss ease-out
      }}
      className="flex-1 flex flex-col w-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
