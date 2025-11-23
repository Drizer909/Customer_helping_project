import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Overview' },
        { path: '/tickets', label: 'Tickets' },
        { path: '/knowledge-base', label: 'Knowledge Base' },
        { path: '/test-agent', label: 'Test Agent' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6">
                <h1 className="text-2xl font-bold mb-8 text-blue-400">SupportAI</h1>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded transition-colors ${location.pathname === item.path
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
