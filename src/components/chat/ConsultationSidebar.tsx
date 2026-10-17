"use client";

import React, { useMemo } from "react";
import { OwlConsultation } from "@/types/owl";
import { IconButton } from "@/components/ui/IconButton";
import { AppIcon } from "@/components/ui/AppIcon";

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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 md:top-16 bottom-0 left-0 z-40 md:z-30 w-72 md:w-64 bg-canvas border-r border-surface-border flex flex-col transition-all duration-300 ease-in-out select-none overflow-hidden
          ${
            isOpen
              ? "translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "-translate-x-full opacity-0 pointer-events-none"
          }
        `}
        aria-label="Past chats"
      >
        <div className="w-full h-full flex flex-col bg-canvas">
          <div className="h-12 px-3.5 border-b border-surface-border/70 flex items-center justify-between gap-2 shrink-0 bg-canvas">
            <span className="text-xs font-semibold text-ink tracking-tight">
              Past chats
            </span>

            <IconButton
              icon="sidebar-minimalistic-linear"
              label="Hide past chats"
              title="Hide past chats (⌘B)"
              variant="ghost"
              size="sm"
              onClick={onToggle}
            />
          </div>

          <div className="p-2.5 pb-1 shrink-0">
            <button
              type="button"
              onClick={onNew}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface hover:bg-white border border-surface-border hover:border-ink/20 text-xs font-medium text-ink shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <AppIcon
                  name="pen-new-square-linear"
                  className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition"
                />
                <span>New chat</span>
              </div>
              <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted border border-surface-border/60">
                ⌘N
              </kbd>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-3 no-scrollbar">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-xs text-ink-muted font-serif italic">
                No past chats yet.
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="space-y-0.5">
                  <div className="px-2.5 pt-2 pb-1 text-xs font-medium text-ink-subtle">
                    {group.label}
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((c) => {
                      const isActive = c.id === activeConsultationId;

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
                          className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-surface border border-surface-border shadow-2xs text-ink font-medium"
                              : "text-ink-secondary hover:text-ink hover:bg-surface/60 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                            <AppIcon
                              name="chat-round-dots-linear"
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? "text-accent-vermilion"
                                  : "text-ink-subtle group-hover:text-ink-secondary"
                              }`}
                            />
                            <span className="text-xs truncate flex-1 leading-snug">
                              {!c.title || c.title === "New Inquiry" ? "New chat" : c.title}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(c.id);
                            }}
                            className="opacity-70 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:text-danger p-1 rounded-md text-ink-muted hover:bg-danger-light transition cursor-pointer shrink-0"
                            aria-label={`Delete chat "${c.title}"`}
                            title="Delete chat"
                          >
                            <AppIcon name="trash-bin-trash-linear" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="h-9 px-3.5 border-t border-surface-border/70 bg-canvas/40 shrink-0 flex items-center justify-between text-xs font-mono text-ink-muted">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isCloudSynced ? "bg-accent-emerald" : "bg-ink-subtle"
                }`}
              />
              <span className="truncate">
                {isCloudSynced
                  ? isSyncingCloud
                    ? "Syncing..."
                    : "Cloud synced"
                  : "Local storage"}
              </span>
            </div>
            <span className="text-ink-subtle text-xs">⌘B</span>
          </div>
        </div>
      </aside>
    </>
  );
}
