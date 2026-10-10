import React from 'react';

interface AuthErrorMessageProps {
  message: string | null;
  id?: string;
}

export function AuthErrorMessage({ message, id }: AuthErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className="text-[11px] text-rose-400 font-bold uppercase tracking-wider text-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/20"
    >
      {message}
    </div>
  );
}
