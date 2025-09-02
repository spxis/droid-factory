import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { lazy } from 'react';

import client from './lib/apollo';
import { SlugMapProvider } from './hooks/useSlugMap';

const CharacterPage = lazy(() => import('./pages/CharacterPage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

import './App.css';

const PROJECT_TITLE = import.meta.env.VITE_PROJECT_TITLE || 'Star Wars Movies';

function App() {
  return (
    <ApolloProvider client={client}>
      <SlugMapProvider>
        <Router>
          <div className="min-h-screen bg-black text-white">
            <nav className="bg-black text-yellow-400 p-4 flex gap-4 border-b border-yellow-900">
              <Link to="/" className="font-bold text-2xl tracking-widest">{PROJECT_TITLE}</Link>
            </nav>
            <main className="p-4">
              <Routes>
                <Route path="/" element={<MoviesPage />} />
                <Route path="/movies/:slug" element={<MovieDetailPage />} />
                <Route path="/characters/:id" element={<CharacterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SlugMapProvider>
    </ApolloProvider>
  );
}

export default App
