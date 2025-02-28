import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';

export default function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="py-4 mb-8 flex justify-between items-center">
      <div className="text-2xl font-bold">Notaverse</div>
      {isAuthenticated && (
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </nav>
  );
}