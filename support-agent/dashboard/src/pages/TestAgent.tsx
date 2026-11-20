import React, { useState } from 'react';
import { supportApi } from '../api/client';

const TestAgent: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<{ response: string; confidence_score: number; status: string; sources: string[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await supportApi.testAgent(query);
            setResponse(res.data);
        } catch (err) {
            console.error("Test failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Test Agent</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">User Query</label>
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                                placeholder="Type a question (e.g., 'What is your refund policy?')"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Send Query'}
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[300px]">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Agent Response</h3>

                    {response ? (
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Response</span>
                                <p className="text-slate-800 mt-1 whitespace-pre-wrap">{response.response}</p>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Confidence</span>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${response.confidence_score > 0.8 ? 'bg-green-100 text-green-800' :
                                                response.confidence_score > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {(response.confidence_score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                                    <div className="mt-1">
                                        <span className="px-2 py-1 rounded text-sm font-medium bg-slate-100 text-slate-800">
                                            {response.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Sources</span>
                                <ul className="mt-1 list-disc list-inside text-sm text-slate-600">
                                    {response.sources?.map((source: string, idx: number) => (
                                        <li key={idx}>{source}</li>
                                    ))}
                                    {(!response.sources || response.sources.length === 0) && <li>No sources cited</li>}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-slate-400">
                            Waiting for input...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestAgent;
