import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import NoteDetailPage from './pages/NoteDetailPage.jsx';
import NewNotePage from './pages/NewNotePage.jsx';
import EditNotePage from './pages/EditNotePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route
          path="/notes/new"
          element={
            <ProtectedRoute>
              <NewNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:id/edit"
          element={
            <ProtectedRoute>
              <EditNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
