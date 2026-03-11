import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium text-surface-700 font-pixel"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "nes-input w-full font-pixel !text-[10px] tracking-wide",
            error && "is-error",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-pixel">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
