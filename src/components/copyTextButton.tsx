"use client";

import type { ComponentPropsWithRef } from "react";

function CopyText({ text, ...props }: { text: string; } & ComponentPropsWithRef<"button">) {
  return (
    <button
      role="button"
      onClick={async () => await navigator.clipboard.writeText(text)}
      {...props}
    >
      Copy
    </button>
  );
}

export default CopyText;
