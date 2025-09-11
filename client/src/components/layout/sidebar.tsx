import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Scale, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Settings,
  Zap,
  Menu,
  ChevronLeft,
  Clock,
  Shield,
  Handshake,
  TrendingUp
} from "lucide-react";

const mainMenuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/legal-support", label: "Legal Support", icon: Scale },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/compliance", label: "Compliance", icon: Shield },
  { path: "/partnerships", label: "Partnerships", icon: Handshake },
  { path: "/research", label: "Market Research", icon: TrendingUp },
];

const analyticsItems = [
  { path: "/analytics", label: "Advanced Analytics", icon: BarChart3 },
  { path: "/automation", label: "Workflow Automation", icon: Zap },
  { path: "/hours", label: "Hours Tracker", icon: Clock },
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
  isCollapsed: boolean;
}

function NavItem({ path, label, icon: Icon, isActive, isCollapsed }: NavItemProps) {
  return (
    <li>
      <Link href={path}>
        <span 
          className={cn(
            "flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer",
            isCollapsed ? "justify-center" : "space-x-3",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          data-testid={`nav-${path.slice(1) || 'dashboard'}`}
          title={isCollapsed ? label : undefined}
        >
          <Icon className="w-4 h-4" />
          {!isCollapsed && <span>{label}</span>}
        </span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">Market Access</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          data-testid="button-toggle-sidebar"
          className={cn("ml-auto", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="p-4 space-y-6">
        {/* Main Menu */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Main Menu
            </h2>
          )}
          <ul className="space-y-1">
            {mainMenuItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
        
        {/* Analytics */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Analytics
            </h2>
          )}
          <ul className="space-y-1">
            {analyticsItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
        
        {/* Administration */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Administration
            </h2>
          )}
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location === item.path}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}