"use client";

import React from "react";

export default function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={`
        w-full
        rounded-lg
        border border-gray-300
        bg-white
        text-gray-900
        p-2

        focus:outline-none
        focus:ring-2
        focus:ring-green-600
        focus:border-green-600

        transition

        ${props.className ?? ""}
      `}
    />
  );
}
