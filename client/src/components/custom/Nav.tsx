import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../ui/button';
import { Breadcrumbs, useBreadcrumbs } from '../ui/breadcrumb';
import { UserDropdown } from './UserDropdown';
import { Compass } from 'lucide-react';

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
          
          {/* Navigation links */}
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button variant="ghost" onClick={() => navigate('/library')}>
                My Library
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/discover')}
              className="flex items-center gap-1"
            >
              <Compass className="h-4 w-4" />
              Discover
            </Button>
          </div>
        </div>
        {isAuthenticated && <UserDropdown />}
      </nav>
      {!isAuthPage && <Breadcrumbs items={breadcrumbItems} className="py-2" />}
    </div>
  );
}