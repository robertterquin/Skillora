"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // On phones the sidebar is an overlay drawer, so Escape should close it.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.innerWidth < 768) onToggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onToggle]);

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
            <span className="text-sm font-semibold text-ink tracking-tight">
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface hover:bg-white border border-surface-border hover:border-ink/20 text-sm font-medium text-ink shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <AppIcon
                  name="pen-new-square-linear"
                  className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition"
                />
                <span>New chat</span>
              </div>
              <kbd className="hidden md:inline text-xs font-mono px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted border border-surface-border/60">
                ⌘N
              </kbd>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-3 no-scrollbar">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-sm text-ink-muted">
                No past chats yet.
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="space-y-0.5">
                  <div className="px-2.5 pt-2 pb-1 text-xs font-medium text-ink-subtle">
                    {group.label}
                  </div>

                  <ul className="space-y-0.5">
                    {group.items.map((c) => {
                      const isActive = c.id === activeConsultationId;
                      const title = !c.title || c.title === "New Inquiry" ? "New chat" : c.title;

                      if (confirmingId === c.id) {
                        return (
                          <li
                            key={c.id}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-danger-light border border-danger-border"
                          >
                            <span className="text-sm text-ink truncate">Delete this chat?</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingId(null);
                                  onDelete(c.id);
                                }}
                                className="px-2 py-1 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-danger-hover cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                autoFocus
                                onClick={() => setConfirmingId(null)}
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-ink-secondary hover:bg-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={c.id}
                          className={`group relative flex items-center rounded-xl transition-colors ${
                            isActive
                              ? "bg-surface border border-surface-border shadow-2xs"
                              : "border border-transparent hover:bg-surface/60"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelect(c.id)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex-1 min-w-0 flex items-center gap-2.5 pl-2.5 pr-1 py-2 text-left cursor-pointer rounded-xl ${
                              isActive ? "text-ink font-medium" : "text-ink-secondary hover:text-ink"
                            }`}
                          >
                            <AppIcon
                              name="chat-round-dots-linear"
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-accent-vermilion" : "text-ink-subtle group-hover:text-ink-secondary"
                              }`}
                            />
                            <span className="text-sm truncate leading-snug">{title}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmingId(c.id)}
                            className="mr-1 p-1.5 rounded-md text-ink-muted hover:text-danger hover:bg-danger-light opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition cursor-pointer shrink-0"
                            aria-label={`Delete chat "${title}"`}
                            title="Delete chat"
                          >
                            <AppIcon name="trash-bin-trash-linear" className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
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
            <span className="hidden md:inline text-ink-subtle text-xs">⌘B</span>
          </div>
        </div>
      </aside>
    </>
  );
}
