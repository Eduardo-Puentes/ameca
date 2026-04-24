import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TableProps = HTMLAttributes<HTMLTableElement> & {
  containerClassName?: string;
};

export function Table({
  className,
  containerClassName,
  ...props
}: TableProps) {
  return (
    <div className={cn("overflow-x-auto", containerClassName)}>
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
