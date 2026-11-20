import React, { useEffect, useState } from 'react';
import { type RecentTicket, supportApi } from '../api/client';

const Tickets: React.FC = () => {
    const pageSize = 25;
    const [tickets, setTickets] = useState<RecentTicket[]>([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        const controller = new AbortController();
        setState('loading');
        const timer = window.setTimeout(async () => {
            try {
                const res = await supportApi.getRecentTickets(pageSize + 1, page * pageSize, search, status, controller.signal);
                if (!controller.signal.aborted) {
                    setTickets(res.data);
                    setState('ready');
                }
            } catch {
                if (!controller.signal.aborted) setState('error');
            }
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [page, search, status, revision]);

    const visible = tickets.slice(0, pageSize);
    function exportPage() {
        const rows = [
            ['ID', 'Email', 'Query', 'Status', 'Confidence', 'Created'],
            ...visible.map(t => [t.id, t.email, t.query, t.status, t.confidence_score, t.created_at])
        ];
        const csv = rows.map(row => row.map(value => {
            let text = String(value ?? '');
            if (/^\s*[=+@-]|^[\t\r\n]/.test(text)) text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
        }).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `tickets-page-${page + 1}.csv`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Tickets</h2>
                <button disabled={state !== "ready" || !visible.length} onClick={exportPage} className="disabled:opacity-50 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export page as CSV</button>
            </div>

            <div className="flex flex-wrap gap-4">
                <label>Search tickets <input type="search" className="border rounded p-2" maxLength={200} placeholder="Email, question or ID" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label>
                <label>Status <select className="border rounded p-2" value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
                    <option value="">All statuses</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option>
                </select></label>
            </div>
            {state === 'loading' ? <p role="status">Loading tickets…</p> :
                state === 'error' ? <p role="alert">Couldn’t load tickets. <button className="underline" onClick={() => setRevision(revision + 1)}>Retry</button></p> :
                <><div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Query</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visible.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">#{ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ticket.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 max-w-sm break-words">{ticket.query}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {ticket.confidence_score === null ? '—' : Math.round(ticket.confidence_score * 100) + '%'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!visible.length && <p className="p-6">No matching tickets.</p>}
            </div>
            <nav aria-label="Ticket pages" className="flex gap-4 items-center">
                <button className="underline disabled:opacity-40" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
                <span>Page {page + 1}</span>
                <button className="underline disabled:opacity-40" disabled={tickets.length <= pageSize} onClick={() => setPage(page + 1)}>Next</button>
            </nav></>}
        </div>
    );
};

export default Tickets;
