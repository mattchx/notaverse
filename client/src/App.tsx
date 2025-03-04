import { BrowserRouter, Routes, Route } from "react-router";
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from "./contexts/AuthContext";
import { AppProviders } from "./contexts/AppProviders";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";
import Nav from "./components/Nav";
import ContentLibrary from "./components/content/ContentLibrary";
import ContentViewer from "./components/content/ContentViewer";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <AuthProvider>
        <AppProviders>
          <BrowserRouter>
            <Nav />
            <div className="text-center">
              <Routes>
                <Route path="/" element={<AuthRoute><Home /></AuthRoute>} />
                <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                {/* Content management routes */}
                <Route path="/content" element={<ProtectedRoute><ContentLibrary /></ProtectedRoute>} />
                <Route path="/content/:id" element={<ProtectedRoute><ContentViewer /></ProtectedRoute>} />
              </Routes>
            </div>
          </BrowserRouter>
        </AppProviders>
      </AuthProvider>
    </div>
  )
}

export default App
