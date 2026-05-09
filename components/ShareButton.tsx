'use client';

import { useState } from 'react';

interface ShareButtonProps {
  auditId: string;
}

export function ShareButton({ auditId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/audit/${auditId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-semibold text-zinc-900"
      aria-label="Copy shareable audit link"
    >
      {copied ? 'Link copied' : 'Share audit'}
    </button>
  );
}
