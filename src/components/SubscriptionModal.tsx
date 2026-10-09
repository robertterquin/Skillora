"use client";

import React from "react";
import { SolarIcon } from "@/components/SolarIcon";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function SubscriptionModal({ isOpen, onClose, userEmail }: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-surface-border shadow-2xl overflow-hidden"
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
          >
            <SolarIcon name="close-circle-linear" className="w-5 h-5" />
          </button>
        </div>

        {/* Content Plans */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-6 rounded-2xl border-2 border-brand-600 bg-white relative shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 border border-brand-200">
                  Recommended
                </span>
                <h3 className="font-display font-bold text-xl text-ink mt-2">Skillora Pro</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Full multi-craft mastery engine & audio flashcards
                </p>
              </div>
              <div className="text-right">
                <span className="font-display font-extrabold text-2xl text-ink">$9.99</span>
                <span className="text-xs text-ink-muted"> / month</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-ink-secondary py-3 border-y border-surface-border">
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Unlimited concurrent skill pathways in My Studio</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Native audio voice speech for language pronunciation</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>3D tactile flashcard practice & streak tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Cloud progress sync across all mobile & desktop devices</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => {
                alert("Stripe Checkout will be connected with Supabase Webhooks! Your plan is active in Demo mode.");
                onClose();
              }}
              className="mt-5 w-full py-2.5 rounded-full bg-ink hover:bg-neutral-800 text-white text-xs font-semibold transition"
            >
              Upgrade to Pro for $9.99/mo
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs text-ink-muted">
              You are currently on the <strong>Free Explorer Tier</strong> (limited to 2 active studio skills).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
