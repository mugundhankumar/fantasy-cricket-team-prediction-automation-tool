import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/Layout';
import Home from './components/Home';
import MatchList from './components/matches/MatchList';
import TeamBuilder from './components/teams/TeamBuilder';
import ErrorBoundary from './components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/matches" element={<MatchList />} />
              <Route path="/team-builder/:matchId" element={<TeamBuilder />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
