import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Scale, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Settings 
} from "lucide-react";

const mainMenuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/legal-support", label: "Legal Support", icon: Scale },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
];

const analyticsItems = [
  { path: "/analytics", label: "Advanced Analytics", icon: BarChart3 },
  { path: "/reports", label: "Reports", icon: TrendingUp },
];

const adminItems = [
  { path: "/users", label: "User Management", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

function NavItem({ path, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <li>
      <Link href={path}>
        <span 
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          data-testid={`nav-${path.slice(1) || 'dashboard'}`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border">
      <nav className="p-4 space-y-6">
        {/* Main Menu */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Main Menu
          </h2>
          <ul className="space-y-1">
            {mainMenuItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
              />
            ))}
          </ul>
        </div>
        
        {/* Analytics */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Analytics
          </h2>
          <ul className="space-y-1">
            {analyticsItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
              />
            ))}
          </ul>
        </div>
        
        {/* Administration */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Administration
          </h2>
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
