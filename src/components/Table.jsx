import React from 'react';

const Table = ({ columns, data }) => (
    <div className="overflow-x-auto rounded-[24px] border border-gray-100 bg-white/50 backdrop-blur-md shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    {columns.map((col) => (
                        <th key={col.accessor} className="px-8 py-5 text-[10px] font-heading font-black uppercase tracking-[0.2em] text-text-muted">
                            {col.Header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.length > 0 ? data.map((row, i) => (
                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                        {columns.map((col) => (
                            <td key={col.accessor} className="px-8 py-6 text-sm font-medium text-text-main group-hover:text-primary transition-colors">
                                {typeof row[col.accessor] === 'object' || React.isValidElement(row[col.accessor]) ? row[col.accessor] : String(row[col.accessor])}
                            </td>
                        ))}
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={columns.length} className="px-8 py-16 text-center text-text-muted italic text-sm font-medium">
                            No academic records found in this context.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

export default Table;
