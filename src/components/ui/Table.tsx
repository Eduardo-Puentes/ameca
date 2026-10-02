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
    <div tabIndex={0} role="region" aria-label="Tabla de datos; desplázate para ver todas las columnas" className={cn("w-full max-w-full overflow-x-auto", containerClassName)}>
      <table
        className={cn(
          "w-full min-w-max border-separate border-spacing-y-2 text-left text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}
