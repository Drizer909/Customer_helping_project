import React, { useEffect, useState } from 'react';
import { supportApi } from '../api/client';

const Tickets: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await supportApi.getRecentTickets(100);
                setTickets(res.data);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Tickets</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export CSV</button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">#{ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ticket.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{ticket.query}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {(ticket.confidence_score * 100).toFixed(0)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Tickets;
