"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SolarIcon } from "@/components/SolarIcon";
import { UserAvatar } from "@/components/UserAvatar";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  completedCount?: number;
  activePath?: string;
}

export function Header({ completedCount = 0, activePath = "/" }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (e) {
        console.error("Error reading auth state", e);
      } finally {
        setLoadingUser(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      setLoadingUser(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Learner";

  const userSeed = currentUser?.email || displayName;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Title with Learning Owl */}
          <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-canvas border border-surface-border transition-all group-hover:scale-105 group-hover:border-ink/20">
              <Image
                src="/logo.svg"
                alt="Skillora Learning Owl"
                width={26}
                height={26}
                className="w-6 h-6 object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink">
                Skillora
              </span>
              <span className="text-[9px] font-semibold text-brand-600 -mt-1 tracking-wider uppercase">
                Master Anything
              </span>
            </div>
          </Link>

          {/* Navigation Links: Depends on Auth Status */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
            {currentUser ? (
              // LOGGED IN NAV: My Studio & Skill Library (no overview)
              <>
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-ink ${
                    activePath === "/dashboard" ? "text-ink font-semibold" : ""
                  }`}
                >
                  My Studio
                </Link>
                <Link
                  href="/library"
                  className={`transition-colors hover:text-ink ${
                    activePath === "/library" ? "text-ink font-semibold" : ""
                  }`}
                >
                  Skill Library
                </Link>
              </>
            ) : (
              // LOGGED OUT NAV: Overview, Skill Library, Pricing
              <>
                <Link
                  href="/"
                  className={`transition-colors hover:text-ink ${
                    activePath === "/" ? "text-ink font-semibold" : ""
                  }`}
                >
                  Overview
                </Link>
                <Link
                  href="/library"
                  className={`transition-colors hover:text-ink ${
                    activePath === "/library" ? "text-ink font-semibold" : ""
                  }`}
                >
                  Skill Library
                </Link>
                <a href="/#pricing" className="transition-colors hover:text-ink">
                  Pricing
                </a>
              </>
            )}
          </nav>

          {/* Right Actions: Avatar & Dropdown when logged in, or Auth buttons */}
          <div className="flex items-center gap-3">
            {!loadingUser && currentUser ? (
              // Logged-in DiceBear Big Smile Profile Dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-full border border-surface-border hover:border-ink/30 bg-white transition hover:scale-105"
                  aria-label="Open user settings"
                >
                  <UserAvatar seed={userSeed} size={34} />
                  <span className="text-xs font-semibold text-ink max-w-[100px] truncate hidden sm:inline pr-2">
                    {displayName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-surface-border shadow-xl p-2 z-50 animate-fade-in text-xs">
                    {/* User Info Header */}
                    <div className="p-3 border-b border-surface-border/80 flex items-center gap-3 mb-1">
                      <UserAvatar seed={userSeed} size={36} />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-ink text-sm truncate">{displayName}</div>
                        <div className="text-[11px] text-ink-muted truncate">{currentUser.email}</div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-canvas text-ink transition"
                      >
                        <SolarIcon name="stars-minimalistic-linear" className="w-4 h-4 text-brand-600" />
                        <span>My Studio</span>
                      </Link>

                      <Link
                        href="/library"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-canvas text-ink transition"
                      >
                        <SolarIcon name="book-bookmark-linear" className="w-4 h-4 text-ink-muted" />
                        <span>Browse Skill Library</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsSubscriptionOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-canvas text-ink transition text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <SolarIcon name="cup-first-linear" className="w-4 h-4 text-amber-500" />
                          <span>Subscription & Pricing</span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                          Pro
                        </span>
                      </button>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-1 mt-1 border-t border-surface-border">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition text-left font-medium"
                      >
                        <SolarIcon name="login-2-linear" className="w-4 h-4 rotate-180" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Logged out buttons
              <>
                <Link
                  href="/signin"
                  className="text-xs sm:text-sm font-medium text-ink-muted hover:text-ink transition-colors px-2.5 py-1.5"
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        userEmail={currentUser?.email}
      />
    </>
  );
}
