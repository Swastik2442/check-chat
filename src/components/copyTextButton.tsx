"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState, type ComponentPropsWithRef } from "react";

function CopyText({ text, ...props }: { text: string; } & ComponentPropsWithRef<"button">) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }}
      role="button"
      {...props}
    >
      <div className="flex justify-between items-center gap-1">
        {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
        <span>Copy</span>
      </div>
    </button>
  );
}

export default CopyText;
