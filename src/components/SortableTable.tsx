"use client";

import { Fragment, ReactNode, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortableColumn<T> {
  header: string;
  sortValue?: (item: T) => string | number;
}

export default function SortableTable<T>({
  items,
  columns,
  renderRow,
  keyFor,
  emptyMessage,
}: {
  items: T[];
  columns: SortableColumn<T>[];
  renderRow: (item: T) => ReactNode;
  keyFor: (item: T) => string;
  emptyMessage: string;
}) {
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<SortDirection>("asc");

  const sortedItems = useMemo(() => {
    if (sortIndex === null) return items;
    const sortValue = columns[sortIndex]?.sortValue;
    if (!sortValue) return items;
    return [...items].sort((a, b) => {
      const va = sortValue(a);
      const vb = sortValue(b);
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), "it");
      return direction === "asc" ? cmp : -cmp;
    });
  }, [items, columns, sortIndex, direction]);

  function handleHeaderClick(index: number) {
    if (sortIndex === index) {
      setDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortIndex(index);
      setDirection("asc");
    }
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={col.header || i}>
              {col.sortValue ? (
                <button
                  type="button"
                  onClick={() => handleHeaderClick(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "none", border: "none", padding: 0,
                    font: "inherit", color: "inherit", cursor: "pointer",
                  }}
                >
                  {col.header}
                  {sortIndex === i && (
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      {direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              ) : col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedItems.length === 0 && (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
              {emptyMessage}
            </td>
          </tr>
        )}
        {sortedItems.map(item => (
          <Fragment key={keyFor(item)}>{renderRow(item)}</Fragment>
        ))}
      </tbody>
    </table>
  );
}
