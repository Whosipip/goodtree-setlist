import { Home, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border z-40">
      <div className="max-w-md mx-auto grid grid-cols-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-3 text-sm transition-colors ${
              isActive ? "text-primary font-semibold" : "text-muted-foreground"
            }`
          }
        >
          <Home className="w-5 h-5 mb-1" />
          Home
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex flex-col items-center py-3 text-sm transition-colors ${
              isActive ? "text-primary font-semibold" : "text-muted-foreground"
            }`
          }
        >
          <Shield className="w-5 h-5 mb-1" />
          Admin
        </NavLink>
      </div>
    </nav>
  );
};
