export function Table({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto card-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-200 bg-sand-50">
            {columns.map((c) => (
              <th key={c} className="px-5 py-3.5 font-semibold text-ink-soft">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sand-100 last:border-0 hover:bg-rose-50/40 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-4 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

