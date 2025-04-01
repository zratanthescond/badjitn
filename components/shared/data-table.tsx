import type { ReactNode } from "react";

interface Column {
  header: string;
  accessor: string;
  align?: "left" | "right";
  cell?: (value: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export default function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="border border-[#334155] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-card">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-sm font-medium text-gray-400 text-${
                    column.align || "left"
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-card-foreground/10 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm text-${
                      column.align || "left"
                    }`}
                  >
                    {column.cell && column.accessor
                      ? column.cell(
                          column.accessor === "root"
                            ? row
                            : row[column.accessor]
                        )
                      : column.accessor
                      ? row[column.accessor]
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
