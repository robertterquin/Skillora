"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { SolarIcon } from "@/components/SolarIcon";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isLimitReached?: boolean;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  userEmail,
  isLimitReached = false,
}: SubscriptionModalProps) {
  const [isUpgraded, setIsUpgraded] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="relative w-full max-w-xl bg-white rounded-3xl border border-surface-border shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-canvas border-b border-surface-border flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-2">
              <SolarIcon name="stars-minimalistic-linear" className="w-3.5 h-3.5" />
              <span>Skillora Membership</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-ink">
              Subscription & Plans
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Active account: <strong className="text-ink">{userEmail || "Learner"}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition"
            aria-label="Close"
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>

        {/* Content Plans */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Limit Reached Warning if triggered */}
          {isLimitReached && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <SolarIcon name="danger-circle-linear" className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Free Plan limit reached:</strong> You can learn up to 3 skills during your 7-day trial. Upgrade to Pro for unlimited skills!
              </span>
            </div>
          )}

          {/* Pro Tier (₱299/mo) */}
          <div className="p-6 rounded-2xl border-2 border-brand-600 bg-white relative shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 border border-brand-200">
                  Unlimited Access
                </span>
                <h3 className="font-display font-bold text-xl text-ink mt-2">Skillora Pro</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Full multi-craft mastery engine & unlimited AI features
                </p>
              </div>
              <div className="text-right">
                <span className="font-display font-extrabold text-2xl text-ink">₱299</span>
                <span className="text-xs text-ink-muted"> / month</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-ink-secondary py-3 border-y border-surface-border">
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span><strong>Learn as many skills as you want</strong> (unlimited studio queue)</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span><strong>Unlimited AI Learning Owl</strong> voice & chat skill summoning</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span><strong>Unlimited Technique Coach</strong> biomechanical diagnostics</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span><strong>Whisper AI Voice Pronunciation</strong> speech grading</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span><strong>Daily 15-Minute Workout Routine</strong> cross-training generator</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Multi-device cloud synchronization & streak tracking</span>
              </li>
            </ul>

            {isUpgraded ? (
              <div className="mt-5 p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-center text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
                <SolarIcon name="check-circle-linear" className="w-4 h-4" />
                <span>Pro Membership Activated — Welcome to Unlimited Access</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsUpgraded(true);
                  setTimeout(() => {
                    onClose();
                    setIsUpgraded(false);
                  }, 1600);
                }}
                className="mt-5 w-full py-2.5 rounded-full bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Upgrade to Pro for ₱299/month
              </button>
            )}
          </div>

          {/* Free Tier Comparison Card */}
          <div className="p-5 rounded-2xl bg-canvas border border-surface-border text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-ink">Free Explorer Tier</span>
              <span className="font-bold text-ink">₱0</span>
            </div>
            <ul className="space-y-1.5 text-ink-muted">
              <li>• Up to <strong>3 active skills</strong> in My Studio</li>
              <li>• <strong>7-Day Trial</strong> for Archimedes Mentor, voice grading, and technique coach</li>
              <li>• Standard step-by-step flashcards & vetted learning links</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
