"use client";

import React from "react";

export default function ResultTable({ title, items, columns, emptyMessage }) {
  if (!items.length) return <p className="text-gray-400">{emptyMessage}</p>;

  return (
    <div className="overflow-auto rounded-lg border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700 text-sm">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left text-gray-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-800">
          {items.map((item, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
