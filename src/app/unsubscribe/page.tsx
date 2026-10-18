"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components";

type Status = "idle" | "working" | "done" | "error";

/**
 * Landing page for the unsubscribe link in reminder emails. It asks for a
 * click rather than unsubscribing on load, so link scanners can't trigger it.
 */
export default function UnsubscribePage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  const unsubscribe = async () => {
    if (!token) return;
    setStatus("working");
    const res = await fetch("/api/reminders/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
    if (res?.ok) {
      setStatus("done");
    } else {
      const body = res ? await res.json().catch(() => ({})) : {};
      setMessage(body.error || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="flex-1 bg-canvas text-ink">
      <main id="main" className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-serif italic text-4xl">
          {status === "done" ? "You're unsubscribed." : "Stop Skillora emails?"}
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted" role={status === "error" ? "alert" : "status"}>
          {status === "done"
            ? "You won't get practice reminders or weekly recaps. You can turn them back on in Settings any time."
            : status === "error"
            ? message
            : token
            ? "This turns off both practice reminders and the weekly recap."
            : "This link is missing its unsubscribe code. Use the link from your email, or change emails in Settings."}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {status !== "done" && token && (
            <Button size="lg" onClick={unsubscribe} disabled={status === "working"}>
              {status === "working" ? "Unsubscribing…" : "Unsubscribe"}
            </Button>
          )}
          <Link href="/settings" className={buttonClasses({ variant: "secondary", size: "lg" })}>
            Open Settings
          </Link>
        </div>
      </main>
    </div>
  );
}
