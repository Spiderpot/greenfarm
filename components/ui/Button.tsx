"use client";

export default function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-green-600 text-white py-2 px-4 ${className}`}
    >
      {children}
    </button>
  );
}
