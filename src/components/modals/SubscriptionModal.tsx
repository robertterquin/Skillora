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
        <div className="p-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 relative shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto">
            <SolarIcon name="cup-first-linear" className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-3xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
              COMMUNITY ACCESS
            </span>
            <h3 className="font-display font-bold text-xl text-ink mt-2">
              All Features Are 100% Free
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto leading-relaxed">
              Skillora is currently free for all learners. You have unlimited access to all skills, roadmaps, and Archimedes AI coaching.
            </p>
          </div>

          <ul className="space-y-2.5 text-xs text-ink-secondary py-4 border-y border-emerald-200/60 text-left max-w-sm mx-auto">
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Unlimited skills</strong> in your studio</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Unlimited custom roadmaps</strong> with Archimedes</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Spaced repetition drills</strong> &amp; timers</span>
            </li>
            <li className="flex items-center gap-2">
              <SolarIcon name="check-circle-linear" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>Skill certifications</strong> &amp; official diplomas</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={onClose}
            className={buttonClasses({ className: "w-full" })}
          >
            Continue Learning
          </button>
        </div>
      </div>
    </Modal>
  );
}
