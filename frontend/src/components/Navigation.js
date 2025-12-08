import { Link, useLocation } from "react-router-dom";
import { Coins, CreditCard, ShoppingBag, TrendingUp } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Coins },
    { path: "/cc-helper", label: "CC Helper", icon: CreditCard },
    { path: "/qcommerce", label: "Q-Commerce", icon: ShoppingBag },
    { path: "/sales-navigator", label: "Sales Navigator", icon: TrendingUp },
  ];

  return (
    <nav className="bg-white border-b-2 border-black shadow-brutal-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-home-link">
            <Coins className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <span className="text-2xl font-heading font-bold text-foreground">Baniya.ai</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}-link`}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-wider
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-white shadow-brutal-sm"
                        : "bg-white text-foreground hover:bg-accent border-2 border-black hover:shadow-brutal-sm"
                    }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;