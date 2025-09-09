import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Building2, 
  Scale, 
  FileText, 
  CheckSquare, 
  BarChart3,
  Users,
  Settings,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, category: "main" },
  { path: "/companies", label: "Companies", icon: Building2, category: "main" },
  { path: "/legal-support", label: "Legal Support", icon: Scale, category: "main" },
  { path: "/documents", label: "Documents", icon: FileText, category: "main" },
  { path: "/tasks", label: "Tasks", icon: CheckSquare, category: "main" },
  { path: "/analytics", label: "Analytics", icon: BarChart3, category: "analytics" },
  { path: "/users", label: "Users", icon: Users, category: "admin" },
  { path: "/settings", label: "Settings", icon: Settings, category: "admin" },
];

interface MobileNavProps {
  isOnline?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export default function MobileNav({ isOnline = true, syncStatus = 'synced' }: MobileNavProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (syncStatus === 'syncing') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getSyncLabel = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing...';
    return 'Online';
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Market Access</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    data-testid="button-close-menu"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sync Status */}
                <div className="mb-6 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getSyncIcon()}
                    <span className="text-sm font-medium" data-testid="text-sync-status">
                      {getSyncLabel()}
                    </span>
                  </div>
                  {!isOnline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Changes will sync when connection is restored
                    </p>
                  )}
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-6">
                  {/* Main Menu */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Main Menu
                    </h3>
                    <div className="space-y-1">
                      {menuItems.filter(item => item.category === 'main').map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                            location === item.path
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          data-testid={`mobile-nav-${item.path.slice(1) || 'dashboard'}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Analytics */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Analytics
                    </h3>
                    <div className="space-y-1">
                      {menuItems.filter(item => item.category === 'analytics').map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                            location === item.path
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          data-testid={`mobile-nav-${item.path.slice(1)}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Administration */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Administration
                    </h3>
                    <div className="space-y-1">
                      {menuItems.filter(item => item.category === 'admin').map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                            location === item.path
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          data-testid={`mobile-nav-${item.path.slice(1)}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-lg">Market Access</h1>
        </div>

        {/* Mobile Status Indicators */}
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isOnline ? "default" : "destructive"}
            className="text-xs"
            data-testid="badge-connection-status"
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {getSyncIcon()}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-5 gap-1 p-2">
          {menuItems.slice(0, 5).map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors",
                location === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
              data-testid={`bottom-nav-${item.path.slice(1) || 'dashboard'}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}