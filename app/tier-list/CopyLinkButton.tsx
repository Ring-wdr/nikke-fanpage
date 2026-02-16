"use client";

import { useCallback, useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copyShareableUrl = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1200);
  }, []);

  return (
    <button
      type="button"
      onClick={copyShareableUrl}
      className="mt-2 shrink-0 rounded-lg border border-cyan-300/40 bg-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/30"
    >
      {copied ? "Link copied" : "Copy share link"}
    </button>
  );
}

