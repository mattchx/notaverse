import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Breadcrumbs, useBreadcrumbs } from '../ui/breadcrumb';

export default function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumbItems = useBreadcrumbs();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4 mb-8">
      <nav className="py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold">Notaverse</div>
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          )}
        </div>
        {isAuthenticated && (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </nav>
      <Breadcrumbs items={breadcrumbItems} className="py-2" />
    </div>
  );
}