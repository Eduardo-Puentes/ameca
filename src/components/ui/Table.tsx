import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full border-separate border-spacing-y-2 text-left text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}
