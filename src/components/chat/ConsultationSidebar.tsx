"use client";

import React, { useMemo } from "react";
import { OwlConsultation, ConsultationOutcome } from "@/types/owl";
import { SolarIcon } from "@/components/ui/SolarIcon";

export interface ConsultationSidebarProps {
  consultations: OwlConsultation[];
  activeConsultationId: string;
  isOpen: boolean;
  isCloudSynced?: boolean;
  isSyncingCloud?: boolean;
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
        style: "bg-brand-50 text-brand-700 border-brand-200/50",
      };
    case "suggestions":
      return {
        label: "Pathways",
        style: "bg-surface-muted text-ink-secondary border-surface-border/60",
      };
    case "enrolled":
      return {
        label: "In Studio",
        style: "bg-emerald-50 text-accent-emerald border-emerald-200/50",
      };
    case "inquiry":
    default:
      return {
        label: "Inquiry",
        style: "bg-surface-muted/60 text-ink-muted border-surface-border/40",
      };
  }
}

export function ConsultationSidebar({
  consultations,
  activeConsultationId,
  isOpen,
  isCloudSynced = false,
  isSyncingCloud = false,
  onToggle,
  onSelect,
  onNew,
  onDelete,
}: ConsultationSidebarProps) {
  // Chronological grouping (Claude / Linear ledger style)
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
        {/* Fixed Width Inner Container (Linear style) */}
        <div className="w-72 md:w-64 h-full flex flex-col shrink-0">
          {/* Header & Close Icon */}
          <div className="h-12 px-3.5 border-b border-surface-border flex items-center justify-between gap-2 shrink-0 bg-surface-subtle">
            <div className="flex items-center gap-1.5 min-w-0">
              <SolarIcon name="history-linear" className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              <span className="text-3xs font-mono font-semibold uppercase tracking-wider text-ink-muted truncate">
                Past Inquiries
              </span>
              {isCloudSynced ? (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[9px] font-mono font-medium text-accent-emerald border border-emerald-200/50 shrink-0"
                  title={isSyncingCloud ? "Syncing with Supabase..." : "Synced with Supabase Cloud Account"}
                >
                  <span className={`w-1 h-1 rounded-full bg-accent-emerald ${isSyncingCloud ? "animate-ping" : ""}`} />
                  Cloud
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-muted text-[9px] font-mono font-medium text-ink-subtle border border-surface-border shrink-0"
                  title="Saved locally on this device"
                >
                  Device
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="w-7 h-7 rounded-lg hover:bg-surface-border/70 text-ink-muted hover:text-ink transition cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="Collapse sidebar (⌘B)"
              title="Collapse sidebar (⌘B)"
            >
              <SolarIcon name="sidebar-minimalistic-linear" className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Consultation Action (Linear styled card with ⌘N badge) */}
          <div className="p-3 shrink-0">
            <button
              type="button"
              onClick={onNew}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-surface-elevated border border-surface-border hover:border-ink/20 text-xs font-medium text-ink shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <SolarIcon
                  name="pen-new-square-linear"
                  className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition"
                />
                <span>New Consultation</span>
              </div>
              <kbd className="text-3xs font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border text-ink-muted">
                ⌘N
              </kbd>
            </button>
          </div>

          {/* Chronological List */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 no-scrollbar">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-muted font-serif italic">
                No previous consultations yet.
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-2 text-3xs font-mono font-semibold uppercase tracking-widest text-ink-muted/80 mb-1">
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
                              ? "bg-white border-surface-border shadow-xs text-ink"
                              : "border-transparent hover:bg-white/80 hover:border-surface-border/60 text-ink-secondary hover:text-ink"
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
                              className="opacity-0 group-hover:opacity-100 hover:text-accent-vermilion p-0.5 rounded text-ink-muted hover:bg-surface-muted transition cursor-pointer shrink-0"
                              aria-label={`Delete consultation "${c.title}"`}
                              title="Delete consultation"
                            >
                              <SolarIcon name="trash-bin-trash-linear" className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Meta row: Outcome pill & Timestamp */}
                          <div className="flex items-center justify-between gap-1 mt-1.5">
                            <span
                              className={`text-3xs font-mono font-medium px-1.5 py-0.5 rounded-md border ${outcome.style}`}
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
          <div className="h-10 px-3.5 border-t border-surface-border bg-surface-subtle shrink-0 flex items-center justify-between text-3xs font-mono text-ink-muted">
            <span className="truncate">Archimedes Atelier</span>
            <span className="text-ink-muted/70">Local-first</span>
          </div>
        </div>
      </aside>
    </>
  );
}
