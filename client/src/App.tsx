import { BrowserRouter, Routes, Route } from "react-router";
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";
import Nav from "./components/Nav";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-8">
      <AuthProvider>
        <BrowserRouter>
          <Nav />
          <div className="text-center">
            <Routes>
              <Route path="/" element={<AuthRoute><Home /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App
