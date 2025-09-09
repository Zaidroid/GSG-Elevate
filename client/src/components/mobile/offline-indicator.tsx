import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database
} from "lucide-react";

interface OfflineData {
  pendingChanges: number;
  lastSync: string;
  dataVersion: string;
}

interface OfflineIndicatorProps {
  isOnline: boolean;
  offlineData: OfflineData;
  onSync: () => void;
  onForceSync: () => void;
}

export default function OfflineIndicator({ 
  isOnline, 
  offlineData, 
  onSync, 
  onForceSync 
}: OfflineIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isOnline && offlineData.pendingChanges === 0) {
    return null; // Don't show when online and synced
  }

  return (
    <Card className="mx-4 mb-4 border-l-4 border-l-primary" data-testid="card-offline-status">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium" data-testid="text-connection-title">
                  {isOnline ? "Connected" : "Offline Mode"}
                </span>
                {offlineData.pendingChanges > 0 && (
                  <Badge variant="secondary" data-testid="badge-pending-changes">
                    {offlineData.pendingChanges} pending
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-sync-description">
                {isOnline 
                  ? `${offlineData.pendingChanges} changes waiting to sync`
                  : "Changes will sync when connection is restored"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOnline && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSync}
                data-testid="button-sync-now"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
              data-testid="button-toggle-details"
            >
              {showDetails ? "Hide" : "Details"}
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2" data-testid="detail-last-sync">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-medium">{offlineData.lastSync}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2" data-testid="detail-data-version">
                <Database className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data Version</p>
                  <p className="text-sm font-medium">{offlineData.dataVersion}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2" data-testid="detail-status">
                {isOnline ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">
                    {isOnline ? "Ready to sync" : "Working offline"}
                  </p>
                </div>
              </div>
            </div>

            {isOnline && offlineData.pendingChanges > 0 && (
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Force sync will overwrite server data with local changes
                </p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onForceSync}
                  data-testid="button-force-sync"
                >
                  Force Sync
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}