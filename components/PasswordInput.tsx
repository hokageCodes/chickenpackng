"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// The bordered container *is* the field; the input is borderless inside it and
// the eye toggle is a sibling, so the icon always sits inside the box.
export default function PasswordInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const [show, setShow] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className: _ignored, ...rest } = props;

  return (
    <div className="flex items-center rounded-lg border border-neutral-300 bg-white focus-within:border-primary">
      <input
        {...rest}
        type={show ? "text" : "password"}
        className="w-full rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="flex shrink-0 items-center px-3 text-neutral-400 transition-colors hover:text-neutral-700"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
