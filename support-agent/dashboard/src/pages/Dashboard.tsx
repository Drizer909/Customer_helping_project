import React, { useEffect, useState } from 'react';
import { supportApi } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<{ total_tickets: number; avg_resolution_time_ms: number; escalation_rate: number; automated_resolution_rate: number } | null>(null);
    const [trendData, setTrendData] = useState<{ date: string; total_tickets: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await supportApi.getMetrics(today, today);
                setMetrics(res.data.metrics);
                setTrendData(res.data.trend_data);
            } catch (err) {
                console.error("Failed to fetch metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Total Tickets</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.total_tickets || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Avg Resolution Time</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{metrics?.avg_resolution_time_ms || 0}ms</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Escalation Rate</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{((metrics?.escalation_rate || 0) * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Automation Rate</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{((metrics?.automated_resolution_rate || 0) * 100).toFixed(1)}%</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Ticket Trend (30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="total_tickets" stroke="#2563eb" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Top Query Categories</h3>
                    <div className="h-64 flex items-center justify-center text-slate-400">
                        {/* Placeholder for category data - would need backend support for categorization */}
                        <p>Category data requires classification implementation</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
