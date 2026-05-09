interface CredexCTAProps {
  variant?: 'inline' | 'button';
}

export function CredexCTA({ variant = 'button' }: CredexCTAProps) {
  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Credex can help you capture these savings with discounted AI credits.
      </div>
    );
  }

  return (
    <a
      href="https://credex.rocks"
      className="inline-flex h-11 items-center justify-center rounded-full bg-amber-500 px-5 text-sm font-semibold text-white"
    >
      Book a Credex consultation
    </a>
  );
}
