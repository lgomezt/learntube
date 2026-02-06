import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { LibraryPage } from './pages/LibraryPage';
import { AddVideoPage } from './pages/AddVideoPage';
import { ProgressPage } from './pages/ProgressPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/add" element={<AddVideoPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
