"use client";

import React, { useMemo } from "react";
import { OwlConsultation, ConsultationOutcome } from "@/types/owl";
import { SolarIcon } from "@/components/ui/SolarIcon";

export interface ConsultationSidebarProps {
  consultations: OwlConsultation[];
  activeConsultationId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll?: () => void;
}

interface GroupedConsultations {
  label: string;
  items: OwlConsultation[];
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getOutcomeLabel(outcome: ConsultationOutcome): { label: string; style: string } {
  switch (outcome) {
    case "curriculum":
      return {
        label: "Curriculum",
        style: "bg-brand-50 text-brand-700 border-brand-200/60",
      };
    case "suggestions":
      return {
        label: "Pathways",
        style: "bg-surface-muted text-ink-secondary border-surface-border",
      };
    case "enrolled":
      return {
        label: "In Studio",
        style: "bg-emerald-50 text-accent-emerald border-emerald-200/60",
      };
    case "inquiry":
    default:
      return {
        label: "Inquiry",
        style: "bg-surface-muted/60 text-ink-muted border-surface-border/50",
      };
  }
}

export function ConsultationSidebar({
  consultations,
  activeConsultationId,
  isOpen,
  onToggle,
  onSelect,
  onNew,
  onDelete,
}: ConsultationSidebarProps) {
  // Chronological grouping
  const groups: GroupedConsultations[] = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const startOfYesterday = startOfToday - oneDayMs;
    const startOfLast7Days = startOfToday - 7 * oneDayMs;

    const todayItems: OwlConsultation[] = [];
    const yesterdayItems: OwlConsultation[] = [];
    const previous7Items: OwlConsultation[] = [];
    const olderItems: OwlConsultation[] = [];

    consultations.forEach((item) => {
      const itemTime = new Date(item.updatedAt || item.createdAt).getTime();
      if (itemTime >= startOfToday) {
        todayItems.push(item);
      } else if (itemTime >= startOfYesterday) {
        yesterdayItems.push(item);
      } else if (itemTime >= startOfLast7Days) {
        previous7Items.push(item);
      } else {
        olderItems.push(item);
      }
    });

    const result: GroupedConsultations[] = [];
    if (todayItems.length > 0) result.push({ label: "Today", items: todayItems });
    if (yesterdayItems.length > 0) result.push({ label: "Yesterday", items: yesterdayItems });
    if (previous7Items.length > 0) result.push({ label: "Previous 7 Days", items: previous7Items });
    if (olderItems.length > 0) result.push({ label: "Older", items: olderItems });

    return result;
  }, [consultations]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:h-full bg-surface-subtle border-r border-surface-border flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden
          ${
            isOpen
              ? "w-72 md:w-64 opacity-100 translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none"
          }
        `}
        aria-label="Consultation History"
      >
        {/* Fixed Width Inner Container to prevent text reflow during collapse animation */}
        <div className="w-72 md:w-64 h-full flex flex-col shrink-0">
          {/* Top Header & Collapse Button */}
          <div className="p-3.5 border-b border-surface-border flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <SolarIcon name="history-linear" className="w-4 h-4 text-ink-muted shrink-0" />
              <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-ink-muted truncate">
                Past Inquiries
              </span>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-surface-border text-ink-muted hover:text-ink transition cursor-pointer shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <SolarIcon name="sidebar-minimalistic-linear" className="w-4 h-4" />
            </button>
          </div>

          {/* New Consultation Action */}
          <div className="p-3 shrink-0">
            <button
              type="button"
              onClick={onNew}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-ink text-white hover:bg-accent-vermilion text-xs font-medium shadow-2xs transition-all cursor-pointer"
            >
              <SolarIcon name="pen-new-square-linear" className="w-4 h-4" />
              <span>New Consultation</span>
            </button>
          </div>

          {/* Chronological Consultation List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-muted font-serif italic">
                No previous consultations yet.
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2 text-3xs font-mono font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    {group.label}
                  </div>

                  <div className="space-y-1">
                    {group.items.map((c) => {
                      const isActive = c.id === activeConsultationId;
                      const outcome = getOutcomeLabel(c.outcomeTag || "inquiry");

                      return (
                        <div
                          key={c.id}
                          onClick={() => onSelect(c.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              onSelect(c.id);
                            }
                          }}
                          className={`group relative flex flex-col p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                            isActive
                              ? "bg-white border-surface-border shadow-xs"
                              : "border-transparent hover:bg-white/70 hover:border-surface-border/50 text-ink-secondary"
                          }`}
                        >
                          {/* Title & Delete Action */}
                          <div className="flex items-start justify-between gap-1.5">
                            <p
                              className={`text-xs truncate flex-1 ${
                                isActive ? "font-semibold text-ink" : "font-normal text-ink"
                              }`}
                            >
                              {c.title || "New Inquiry"}
                            </p>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(c.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-accent-vermilion p-0.5 rounded text-ink-muted transition cursor-pointer"
                              aria-label={`Delete consultation "${c.title}"`}
                            >
                              <SolarIcon name="trash-bin-trash-linear" className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Meta row: Outcome pill & Timestamp */}
                          <div className="flex items-center justify-between gap-1 mt-1.5">
                            <span
                              className={`text-3xs font-mono font-medium px-1.5 py-0.5 rounded-full border ${outcome.style}`}
                            >
                              {outcome.label}
                            </span>
                            <span className="text-3xs font-mono text-ink-muted">
                              {formatTime(c.updatedAt || c.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-surface-border bg-surface-subtle shrink-0">
            <div className="flex items-center justify-between text-3xs font-mono text-ink-muted px-1">
              <span>Archimedes Atelier</span>
              <span>Local-first · Offline</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
