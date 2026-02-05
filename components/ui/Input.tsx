"use client";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border p-2"
    />
  );
}
