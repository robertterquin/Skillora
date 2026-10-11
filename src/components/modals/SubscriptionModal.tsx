"use client";

import React, { useState, useId } from "react";
import { SolarIcon } from "../ui/SolarIcon";
import { Modal } from "../ui/Modal";
import { buttonClasses } from "../ui/Button";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isLimitReached?: boolean;
  onUpgradeSuccess?: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  userEmail,
  isLimitReached = false,
  onUpgradeSuccess,
}: SubscriptionModalProps) {
  const titleId = useId();
  const [isUpgraded, setIsUpgraded] = useState(false);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} labelledBy={titleId} className="max-w-xl bg-white border border-surface-border">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-canvas border-b border-surface-border flex items-start justify-between">
        <div>
          <h2 id={titleId} className="font-display font-extrabold text-2xl text-ink">
            Plan &amp; billing
          </h2>
          {userEmail && (
            <p className="text-xs text-ink-muted mt-1">
              Signed in as <strong className="text-ink">{userEmail}</strong>
            </p>
          )}
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
              <strong>You&apos;ve reached the free plan limit.</strong> Upgrade to Pro for unlimited skills and AI features.
            </span>
          </div>
        )}

        {/* Pro Tier (₱299/mo) */}
        <div className="p-6 rounded-2xl border-2 border-brand-600 bg-white relative shadow-xs">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-ink">Pro</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Unlimited skills and AI features
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
              <span><strong>Unlimited skills</strong> in My Studio</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span><strong>Unlimited Archimedes</strong> skill breakdowns</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span><strong>Unlimited</strong> technique coaching</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span><strong>Unlimited</strong> voice pronunciation grading</span>
            </li>
          </ul>

          {isUpgraded ? (
            <div className="mt-5 p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-center text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
              <SolarIcon name="check-circle-linear" className="w-4 h-4" />
              <span>You&apos;re on Pro. Enjoy unlimited skills.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("skillora_pro_membership", "true");
                }
                setIsUpgraded(true);
                if (onUpgradeSuccess) onUpgradeSuccess();
                setTimeout(() => {
                  onClose();
                  setIsUpgraded(false);
                }, 1600);
              }}
              className={buttonClasses({ className: "mt-5 w-full" })}
            >
              Upgrade to Pro · ₱299/month
            </button>
          )}
        </div>

        {/* Free Tier Comparison Card */}
        <div className="p-5 rounded-2xl bg-canvas border border-surface-border text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-ink">Free</span>
            <span className="font-bold text-ink">₱0</span>
          </div>
          <ul className="space-y-1.5 text-ink-muted">
            <li>• Up to <strong>3 skills</strong> in My Studio</li>
            <li>• <strong>7 days</strong> of Archimedes, voice grading, and technique coaching</li>
            <li>• Flashcards, practice tools, and curated resources</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
