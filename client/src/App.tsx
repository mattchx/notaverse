import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import { AuthProvider } from "./contexts/AuthContext";
import { AppProviders } from "./contexts/AppProviders";
import { ResourceProvider } from "./contexts/ResourceContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";
import Nav from "./components/custom/Nav";
import ResourceLibrary from "./components/resource/ResourceLibrary";
import ResourceViewer from "./components/resource/ResourceViewer";
import PublicResourceLibrary from "./components/resource/PublicResourceLibrary";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <AuthProvider>
        <AppProviders>
          <ResourceProvider>
            <BrowserRouter>
              <Nav />
              <div className="text-center">
                <Routes>
                  <Route path="/" element={<AuthRoute><Home /></AuthRoute>} />
                  <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
                  <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/library" replace /></ProtectedRoute>} />
                  {/* Resource management routes */}
                  <Route path="/library" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
                  <Route path="/library/item/:id" element={<ProtectedRoute><ResourceViewer /></ProtectedRoute>} />
                  {/* Public resource discovery */}
                  <Route path="/discover" element={<PublicResourceLibrary />} />
                  {/* Alternative resource paths that match API structure */}
                  <Route path="/resources" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
                  <Route path="/resources/:id" element={<ProtectedRoute><ResourceViewer /></ProtectedRoute>} />
                </Routes>
              </div>
            </BrowserRouter>
          </ResourceProvider>
        </AppProviders>
      </AuthProvider>
    </div>
  )
}

export default App
