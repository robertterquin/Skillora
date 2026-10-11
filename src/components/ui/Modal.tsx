"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /** Panel classes: width, background, border, and layout. */
  className?: string;
  /** Replaces the default backdrop tone (e.g. a darker cinema backdrop). */
  overlayClassName?: string;
  /** id of the visible title element. */
  labelledBy?: string;
  /** Accessible name when there is no visible title. */
  label?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

// Open modals, innermost last. Only the top one reacts to Escape and Tab.
const modalStack: symbol[] = [];
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";

function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  savedBodyOverflow = document.body.style.overflow;
  savedBodyPaddingRight = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
}

function unlockBodyScroll() {
  document.body.style.overflow = savedBodyOverflow;
  document.body.style.paddingRight = savedBodyPaddingRight;
}

export function Modal({ onClose, children, className, overlayClassName, labelledBy, label }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const id = Symbol("modal");
    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (modalStack.length === 0) lockBodyScroll();
    modalStack.push(id);
    panelRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== id) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const idx = modalStack.indexOf(id);
      if (idx !== -1) modalStack.splice(idx, 1);
      if (modalStack.length === 0) unlockBodyScroll();
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Ignore drags that start inside the panel (e.g. text selection) and end on the backdrop.
        if (pressStartedOnBackdrop.current && e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto",
        overlayClassName ?? "bg-ink/70 backdrop-blur-sm"
      )}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className={cn("relative w-full rounded-3xl shadow-2xl overflow-hidden my-auto outline-none", className)}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}
