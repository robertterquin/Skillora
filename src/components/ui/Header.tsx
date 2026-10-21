"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { isSoundEnabled, setSoundEnabled, playMechanicalClick } from "@/lib/workbench-audio";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme";
import { AppIcon } from "./AppIcon";
import { buttonClasses } from "./Button";
import { IconButton } from "./IconButton";
import { UserAvatar } from "./UserAvatar";

interface HeaderProps {
  activePath?: string;
}

const SIGNED_IN_LINKS = [
  { href: "/dashboard", label: "Studio" },
  { href: "/library", label: "Ask Archimedes" },
];

const SIGNED_OUT_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/library", label: "Ask Archimedes" },
];

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Studio", icon: "stars-minimalistic-linear" },
  { href: "/dashboard?open=passport", label: "Certificates", icon: "diploma-verified-linear" },
  { href: "/library", label: "Ask Archimedes", icon: "chat-round-dots-linear" },
  { href: "/settings", label: "Settings", icon: "tuning-2-linear" },
];

const HIDDEN_ON = ["/signin", "/signup"];

const THEME_CYCLE: Record<ThemePreference, { next: ThemePreference; icon: string; label: string }> = {
  system: { next: "light", icon: "monitor-linear", label: "System" },
  light: { next: "dark", icon: "sun-linear", label: "Light" },
  dark: { next: "system", icon: "moon-linear", label: "Dark" },
};

export function Header({ activePath }: HeaderProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser, isLoading: loadingUser, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const { preference: theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (pathname && HIDDEN_ON.includes(pathname)) {
    return null;
  }

  const currentPath = activePath || pathname || "/";

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playMechanicalClick();
  };

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Learner";

  const userSeed = currentUser?.email || displayName;
  const navLinks = currentUser ? SIGNED_IN_LINKS : SIGNED_OUT_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-canvas/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-surface border border-surface-border transition-all group-hover:scale-105 group-hover:border-brand-400">
            <Image src="/logo.svg" alt="" width={26} height={26} className="w-6 h-6 object-contain" priority />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink truncate">Skillora</span>
        </Link>

        {!loadingUser && (
          <nav
            aria-label="Main"
            className="hidden md:flex items-center gap-1 p-1 bg-surface-muted/60 border border-surface-border/60 rounded-full text-sm font-medium"
          >
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full transition-colors whitespace-nowrap",
                    isActive ? "text-ink font-semibold" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="header-active-nav"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-white rounded-full shadow-2xs border border-surface-border/80"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <IconButton
            icon={THEME_CYCLE[theme].icon}
            label={`Theme: ${THEME_CYCLE[theme].label}. Switch to ${THEME_CYCLE[THEME_CYCLE[theme].next].label}`}
            title={`Theme: ${THEME_CYCLE[theme].label}`}
            onClick={() => setTheme(THEME_CYCLE[theme].next)}
            className="hidden sm:inline-flex"
          />
          <IconButton
            icon={soundOn ? "volume-loud-linear" : "volume-cross-linear"}
            label={soundOn ? "Mute interface sounds" : "Turn on interface sounds"}
            pressed={soundOn}
            onClick={toggleSound}
            className="hidden sm:inline-flex"
          />

          {loadingUser ? (
            <div className="w-9 h-9 rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
          ) : currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full border border-surface-border hover:border-ink/30 bg-white transition cursor-pointer"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
              >
                <UserAvatar seed={userSeed} name={displayName} size={30} />
                <span className="text-sm font-semibold text-ink max-w-[120px] truncate hidden sm:inline pr-2">
                  {displayName}
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-surface-border shadow-elevated p-2 z-50 animate-fade-in text-sm"
                >
                  <div className="p-3 border-b border-surface-border/80 flex items-center gap-3 mb-1">
                    <UserAvatar seed={userSeed} name={displayName} size={36} />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-ink truncate">{displayName}</div>
                      <div className="text-xs text-ink-muted truncate">{currentUser.email}</div>
                    </div>
                  </div>

                  <div className="py-1">
                    {ACCOUNT_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-canvas text-ink transition"
                      >
                        <AppIcon name={item.icon} className="w-4 h-4 text-ink-muted" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-1 mt-1 border-t border-surface-border">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-danger-light text-danger transition text-left font-medium cursor-pointer"
                    >
                      <AppIcon name="login-2-linear" className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className={buttonClasses({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}
              >
                Sign in
              </Link>
              <Link href="/signup" className={buttonClasses({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}

          {!loadingUser && (
            <div className="md:hidden" ref={mobileMenuRef}>
              <IconButton
                icon={isMobileMenuOpen ? "close" : "menu"}
                label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />

              {isMobileMenuOpen && (
                <nav
                  id="mobile-nav"
                  aria-label="Main"
                  className="absolute left-0 right-0 top-full border-b border-surface-border bg-white shadow-elevated animate-fade-in"
                >
                  <div className="px-4 py-3 flex flex-col">
                    {navLinks.map((link) => {
                      const isActive = currentPath === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "px-3 py-3 rounded-xl text-sm transition hover:bg-canvas",
                            isActive ? "text-ink font-semibold bg-canvas" : "text-ink-secondary"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}

                    {currentUser ? (
                      <Link
                        href="/dashboard?open=passport"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-3 py-3 rounded-xl text-sm text-ink-secondary transition hover:bg-canvas"
                      >
                        Certificates
                      </Link>
                    ) : (
                      <Link
                        href="/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-1 pt-4 pb-3 px-3 border-t border-surface-border text-sm text-ink-secondary"
                      >
                        Sign in
                      </Link>
                    )}

                    <div className="sm:hidden mt-1 pt-3 border-t border-surface-border grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme(THEME_CYCLE[theme].next)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surface-border text-sm text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={THEME_CYCLE[theme].icon} className="w-4 h-4" />
                        <span>Theme: {THEME_CYCLE[theme].label}</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={soundOn}
                        onClick={toggleSound}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surface-border text-sm text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={soundOn ? "volume-loud-linear" : "volume-cross-linear"} className="w-4 h-4" />
                        <span>Sound {soundOn ? "on" : "off"}</span>
                      </button>
                    </div>
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
