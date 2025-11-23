import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import KnowledgeBase from './pages/KnowledgeBase';
import TestAgent from './pages/TestAgent';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="test-agent" element={<TestAgent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
