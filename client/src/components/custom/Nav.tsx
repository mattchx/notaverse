import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Breadcrumbs, useBreadcrumbs } from '../ui/breadcrumb';
import { UserDropdown } from './UserDropdown';

export default function Nav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const breadcrumbItems = useBreadcrumbs();

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
        {isAuthenticated && <UserDropdown />}
      </nav>
      <Breadcrumbs items={breadcrumbItems} className="py-2" />
    </div>
  );
}