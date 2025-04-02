import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../ui/button';
import { Breadcrumbs, useBreadcrumbs } from '../ui/breadcrumb';
import { UserDropdown } from './UserDropdown';

export default function Nav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbItems = useBreadcrumbs();
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="space-y-4 mb-8">
      <nav className="py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {!isAuthPage && <div className="text-2xl font-bold">Notaverse</div>}
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/library')}>
              Resource Library
            </Button>
          )}
        </div>
        {isAuthenticated && <UserDropdown />}
      </nav>
      {!isAuthPage && <Breadcrumbs items={breadcrumbItems} className="py-2" />}
    </div>
  );
}