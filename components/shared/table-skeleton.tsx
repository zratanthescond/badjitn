export default function TableSkeleton({
  columns = 7,
  rows = 20,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="border border-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-card-foreground/10">
              {Array(columns)
                .fill(0)
                .map((_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <div className="h-4 bg-card rounded animate-pulse w-20"></div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-foreground/10">
            {Array(rows)
              .fill(0)
              .map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-card-foreground/10">
                  {Array(columns)
                    .fill(0)
                    .map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div
                          className={`h-4 bg-card rounded animate-pulse ${
                            colIndex === columns - 1
                              ? "ml-auto w-16"
                              : "w-full max-w-[120px]"
                          }`}
                          style={{
                            animationDelay: `${
                              (rowIndex * columns + colIndex) * 0.05
                            }s`,
                            width:
                              colIndex === 0
                                ? "60px"
                                : colIndex === columns - 1
                                ? "60px"
                                : `${Math.floor(Math.random() * 40) + 60}px`,
                          }}
                        ></div>
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
