"use client";

export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg border p-2"
    />
  );
}
