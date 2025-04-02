import { useLocation, useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = location.pathname === item.href;

        return (
          <div key={item.href} className="flex items-center">
            <button
              onClick={() => navigate(item.href)}
              className={cn(
                "hover:text-primary transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {item.label}
            </button>
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function useBreadcrumbs() {
  const location = useLocation();
  
  // Get breadcrumb items based on current route
  const getItems = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      
      // Map route segments to readable labels
      switch (segment) {
        case 'library':
          breadcrumbs.push({ label: 'Library', href: currentPath });
          break;
        case 'resources':
          breadcrumbs.push({ label: 'Library', href: currentPath });
          break;
        case 'register':
          breadcrumbs.push({ label: 'Register', href: currentPath });
          break;
        case 'login':
          breadcrumbs.push({ label: 'Login', href: currentPath });
          break;
        case 'profile':
          breadcrumbs.push({ label: 'Profile', href: currentPath });
          break;
        case 'settings':
          breadcrumbs.push({ label: 'Settings', href: currentPath });
          break;
        case 'item':
          breadcrumbs.push({ label: 'Resource', href: currentPath });
          break;
        default:
          // If it's an ID parameter (e.g., in /library/item/:id), don't add it
          if (!segment.match(/^[0-9a-f-]+$/)) {
            breadcrumbs.push({ label: segment, href: currentPath });
          } else if (pathSegments[0] === 'resources' && pathSegments.length === 2) {
            // For /resources/:id route
            breadcrumbs.push({ label: 'Resource', href: currentPath });
          }
      }
    });

    return breadcrumbs;
  };

  return getItems();
}
