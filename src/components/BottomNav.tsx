import { NavLink } from 'react-router-dom';
import { Heart, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navItems = [
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 backdrop-blur-lg" aria-label="Main navigation">
      <ul className="flex items-center justify-around py-2 px-4 max-w-md mx-auto" role="list">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="sr-only">{isActive ? ', current page' : ''}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;