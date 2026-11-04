"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { isSoundEnabled, setSoundEnabled, playMechanicalClick } from "@/lib/workbench-audio";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme";
import { AppIcon } from "./AppIcon";
import { IconButton } from "./IconButton";
import { UserAvatar } from "./UserAvatar";

interface HeaderProps {
  activePath?: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: string;
}

const SIGNED_IN_LINKS: NavLinkItem[] = [
  { href: "/dashboard", label: "Studio", icon: "home-2-linear" },
  { href: "/library", label: "Ask Archimedes", icon: "stars-minimalistic-linear" },
  { href: "/dashboard?open=passport", label: "Certificates", icon: "diploma-verified-linear" },
];

const SIGNED_OUT_LINKS: NavLinkItem[] = [
  { href: "/", label: "Overview", icon: "home-2-linear" },
  { href: "/library", label: "Ask Archimedes", icon: "stars-minimalistic-linear" },
];

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Studio", icon: "home-2-linear" },
  { href: "/dashboard?open=passport", label: "Certificates", icon: "diploma-verified-linear" },
  { href: "/library", label: "Ask Archimedes", icon: "stars-minimalistic-linear" },
  { href: "/settings", label: "Settings", icon: "tuning-2-linear" },
];

const HIDDEN_ON = ["/signin", "/signup"];

const THEME_CYCLE: Record<ThemePreference, { next: ThemePreference; icon: string; label: string }> = {
  system: { next: "light", icon: "monitor-linear", label: "System" },
  light: { next: "dark", icon: "sun-linear", label: "Light" },
  dark: { next: "system", icon: "moon-linear", label: "Dark" },
};

function HeaderContent({ activePath }: HeaderProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  }, [pathname, searchParams]);

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

  const isRouteActive = (href: string) => {
    if (href === "/dashboard?open=passport") {
      return pathname === "/dashboard" && searchParams?.get("open") === "passport";
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard" && searchParams?.get("open") !== "passport";
    }
    if (href === "/library") {
      return pathname?.startsWith("/library");
    }
    if (href === "/") {
      return pathname === "/";
    }
    return currentPath === href;
  };

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

  const firstName = displayName.split(" ")[0] || "Profile";
  const userSeed = currentUser?.email || displayName;
  const navLinks = currentUser ? SIGNED_IN_LINKS : SIGNED_OUT_LINKS;

  return (
    <header className="sticky top-2 sm:top-3.5 z-40 w-full flex justify-center pointer-events-none px-3 sm:px-6">
      <div
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-2 sm:gap-4",
          "w-full max-w-4xl min-h-[56px] px-3 sm:px-4 py-1.5",
          "bg-white/95 dark:bg-[#1E1A17]/95 backdrop-blur-xl",
          "border border-[#E4DDD3]/90 dark:border-white/10 rounded-full",
          "shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_2px_8px_-1px_rgba(0,0,0,0.04),0_10px_24px_-5px_rgba(0,0,0,0.07)]",
          "transition-all duration-200 hover:border-brand-500/30"
        )}
      >
        {/* Left: Brand Lockup */}
        <Link
          href={currentUser ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 px-1.5 py-1 rounded-full group min-w-0 transition-opacity hover:opacity-85"
        >
          <div className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#F7EFE9] dark:bg-brand-500/15 border border-[#EDDFD5] dark:border-brand-500/25 transition-transform group-hover:scale-105 shadow-2xs">
            <Image src="/logo.svg" alt="" width={22} height={22} className="w-5 h-5 object-contain" priority />
          </div>
          <strong className="font-display font-extrabold text-[18px] tracking-tight text-ink">Skillora</strong>
        </Link>

        {/* Center: Segmented Capsule Navigation */}
        {!loadingUser && (
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1 p-1 bg-[#F5F2EB]/90 dark:bg-surface-muted/70 border border-[#E7E2D6] dark:border-surface-border/60 rounded-full text-sm"
          >
            {navLinks.map((link) => {
              const isActive = isRouteActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-bold transition-colors whitespace-nowrap",
                    isActive
                      ? "text-brand-700 dark:text-brand-400 font-extrabold"
                      : "text-ink-muted hover:text-ink hover:bg-white/50 dark:hover:bg-surface/50"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="header-active-capsule"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-white dark:bg-surface rounded-full border border-brand-300/80 dark:border-brand-500/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                    <AppIcon name={link.icon} className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right: Actions & User Capsule */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {loadingUser ? (
            <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
          ) : currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full border border-[#E7E2D6] dark:border-surface-border bg-[#F8F6F0] dark:bg-surface hover:bg-white dark:hover:bg-surface-elevated hover:border-brand-400/60 transition cursor-pointer shadow-2xs group"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
              >
                <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#F5A524] text-[#7B341E] font-extrabold text-xs shadow-2xs">
                  <UserAvatar seed={userSeed} name={displayName} size={30} className="w-full h-full border-0 shadow-none" />
                </div>
                <span className="text-[13.5px] font-bold text-ink max-w-[110px] truncate">
                  {firstName}
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E7E2D6] dark:border-surface-border shadow-elevated p-2 z-50 animate-fade-in text-sm"
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

                  <div className="pt-2 mt-1 border-t border-surface-border">
                    <div className="grid grid-cols-2 gap-1.5 px-1 pb-2">
                      <button
                        type="button"
                        onClick={() => setTheme(THEME_CYCLE[theme].next)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={THEME_CYCLE[theme].icon} className="w-3.5 h-3.5" />
                        <span>{THEME_CYCLE[theme].label}</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={soundOn}
                        onClick={toggleSound}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={soundOn ? "volume-loud-linear" : "volume-cross-linear"} className="w-3.5 h-3.5" />
                        <span>Sound {soundOn ? "on" : "off"}</span>
                      </button>
                    </div>

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
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold text-ink bg-[#F8F6F0] dark:bg-surface border border-[#E7E2D6] dark:border-surface-border hover:bg-white dark:hover:bg-surface-elevated hover:border-brand-400/60 transition shadow-2xs"
            >
              <AppIcon name="login-linear" className="w-3.5 h-3.5 text-ink-muted" />
              <span>Sign in</span>
            </Link>
          )}

          {/* Mobile Menu Toggle (< md) */}
          {!loadingUser && (
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <IconButton
                icon={isMobileMenuOpen ? "close" : "menu"}
                label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full border border-[#E7E2D6] dark:border-surface-border bg-[#F8F6F0] dark:bg-surface shadow-2xs"
                size="sm"
              />

              {isMobileMenuOpen && (
                <nav
                  id="mobile-nav"
                  aria-label="Mobile Navigation"
                  className="absolute right-0 top-full mt-2.5 w-64 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E7E2D6] dark:border-surface-border shadow-elevated p-3 z-50 animate-fade-in"
                >
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      const isActive = isRouteActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition",
                            isActive
                              ? "text-brand-700 dark:text-brand-400 bg-brand-500/10 font-bold"
                              : "text-ink-secondary hover:bg-canvas"
                          )}
                        >
                          <AppIcon name={link.icon} className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}

                    {!currentUser && (
                      <Link
                        href="/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-1 pt-3 border-t border-surface-border flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-ink-secondary hover:bg-canvas rounded-2xl"
                      >
                        <AppIcon name="login-linear" className="w-4 h-4" />
                        <span>Sign in</span>
                      </Link>
                    )}

                    <div className="sm:hidden mt-2 pt-2 border-t border-surface-border grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTheme(THEME_CYCLE[theme].next)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={THEME_CYCLE[theme].icon} className="w-3.5 h-3.5" />
                        <span>{THEME_CYCLE[theme].label}</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={soundOn}
                        onClick={toggleSound}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-canvas transition cursor-pointer"
                      >
                        <AppIcon name={soundOn ? "volume-loud-linear" : "volume-cross-linear"} className="w-3.5 h-3.5" />
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

function HeaderFallback() {
  return (
    <header className="sticky top-2 sm:top-3.5 z-40 w-full flex justify-center pointer-events-none px-3 sm:px-6">
      <div className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-4xl min-h-[56px] px-4 py-1.5 bg-white/95 dark:bg-[#1E1A17]/95 backdrop-blur-xl border border-[#E4DDD3]/90 dark:border-white/10 rounded-full shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_2px_8px_-1px_rgba(0,0,0,0.04),0_10px_24px_-5px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface-muted" />
          <div className="w-20 h-5 rounded bg-surface-muted" />
        </div>
      </div>
    </header>
  );
}

export function Header(props: HeaderProps = {}) {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
