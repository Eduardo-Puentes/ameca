import type { ReactNode } from "react";
import { Table } from "@/components/ui/Table";

export type Column<T> = {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  tableContainerClassName,
}: {
  columns: Column<T>[];
  data: T[];
  tableContainerClassName?: string;
}) {
  return (
    <Table containerClassName={tableContainerClassName}>
      <thead>
        <tr className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {columns.map((col) => (
            <th key={String(col.accessor)} className={col.className ?? "px-3 py-2"}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={idx} className="rounded-xl bg-[var(--surface-2)]">
            {columns.map((col) => (
              <td key={String(col.accessor)} className={col.className ?? "px-3 py-4"}>
                {col.render
                  ? col.render(item)
                  : String((item as Record<string, unknown>)[String(col.accessor)] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
