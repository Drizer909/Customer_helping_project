import React, { useEffect, useState } from 'react';
import { supportApi } from '../api/client';

const KnowledgeBase: React.FC = () => {
    const [stats, setStats] = useState<{ total_docs: number; last_updated: string | null; doc_titles: string[] } | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await supportApi.getKbStats();
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch KB stats", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        try {
            await supportApi.ingestDocument(e.target.files[0]);
            await fetchStats();
            alert("Document ingested successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Knowledge Base</h2>
                <div className="relative">
                    <input
                        type="file"
                        accept=".md,.txt"
                        disabled={uploading}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${uploading ? 'opacity-50' : ''}`}
                    >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Total Documents</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total_docs || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 col-span-2">
                    <h3 className="text-slate-500 text-sm font-medium">Last Updated</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : 'Never'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Ingested Documents</h3>
                <ul className="divide-y divide-slate-200">
                    {stats?.doc_titles?.map((title: string, idx: number) => (
                        <li key={idx} className="py-3 flex justify-between items-center">
                            <span className="text-slate-700">{title}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                        </li>
                    ))}
                    {(!stats?.doc_titles || stats.doc_titles.length === 0) && (
                        <li className="py-3 text-slate-500 italic">No documents found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default KnowledgeBase;
