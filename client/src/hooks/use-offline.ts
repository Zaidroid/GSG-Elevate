import { useState, useEffect } from "react";

interface OfflineData {
  pendingChanges: number;
  lastSync: string;
  dataVersion: string;
}

interface OfflineState {
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  offlineData: OfflineData;
}

export function useOffline() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    syncStatus: 'synced',
    offlineData: {
      pendingChanges: 0,
      lastSync: new Date().toLocaleString(),
      dataVersion: 'v1.0.0'
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: true,
        syncStatus: prev.offlineData.pendingChanges > 0 ? 'syncing' : 'synced'
      }));
      
      // Auto-sync when coming back online
      if (offlineState.offlineData.pendingChanges > 0) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: false,
        syncStatus: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineState.offlineData.pendingChanges]);

  const addPendingChange = () => {
    setOfflineState(prev => ({
      ...prev,
      offlineData: {
        ...prev.offlineData,
        pendingChanges: prev.offlineData.pendingChanges + 1
      }
    }));
  };

  const syncOfflineData = async () => {
    if (!offlineState.isOnline) return;

    setOfflineState(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOfflineState(prev => ({
        ...prev,
        syncStatus: 'synced',
        offlineData: {
          ...prev.offlineData,
          pendingChanges: 0,
          lastSync: new Date().toLocaleString()
        }
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setOfflineState(prev => ({ ...prev, syncStatus: 'offline' }));
    }
  };

  const forceSync = async () => {
    if (!offlineState.isOnline) return;

    setOfflineState(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      // Simulate force sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setOfflineState(prev => ({
        ...prev,
        syncStatus: 'synced',
        offlineData: {
          ...prev.offlineData,
          pendingChanges: 0,
          lastSync: new Date().toLocaleString(),
          dataVersion: `v1.0.${Date.now()}`
        }
      }));
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  return {
    ...offlineState,
    addPendingChange,
    syncOfflineData,
    forceSync
  };
}