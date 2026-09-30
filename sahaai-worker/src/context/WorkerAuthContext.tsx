import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workerApi } from '../api/workerApi';
import type { WorkerAuthUser, WorkerProfileDto, WorkerStatus } from '../types/worker.types';

interface WorkerAuthContextType {
  user: WorkerAuthUser | null;
  profile: WorkerProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  status: WorkerStatus;
  currentCoords: { latitude: number; longitude: number } | null;
  isGpsTracking: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<{ userId: number; workerId: number; message: string }>;
  logout: () => void;
  toggleOnline: () => Promise<boolean>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  toggleGpsTracking: () => void;
  refreshProfile: () => Promise<void>;
}

const WorkerAuthContext = createContext<WorkerAuthContextType | undefined>(undefined);

export const WorkerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<WorkerAuthUser | null>(() => {
    const saved = localStorage.getItem('sahaai_worker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<WorkerProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<WorkerStatus>('Offline');
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGpsTracking, setIsGpsTracking] = useState<boolean>(true);

  const isAuthenticated = !!user && !!localStorage.getItem('sahaai_worker_token');
  const isOnline = status !== 'Offline';

  // Load Profile from backend
  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('sahaai_worker_token')) return;
    try {
      const res = await workerApi.getProfile();
      if (res.data) {
        setProfile(res.data);
        setStatus(res.data.status || (res.data.isOnline ? 'Online' : 'Offline'));
        if (res.data.currentLatitude && res.data.currentLongitude) {
          setCurrentCoords({
            latitude: res.data.currentLatitude,
            longitude: res.data.currentLongitude,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch worker profile:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await refreshProfile();
      }
      setIsLoading(false);
    };
    init();
  }, [isAuthenticated, refreshProfile]);

  // Login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await workerApi.login({ username, password });
      if (res.data) {
        if (res.data.role !== 'Worker') {
          throw new Error('Access denied: Only accounts registered as Worker can access this portal.');
        }
        localStorage.setItem('sahaai_worker_token', res.data.token);
        localStorage.setItem('sahaai_worker_user', JSON.stringify(res.data));
        setUser(res.data);
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const res = await workerApi.register(formData);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    // If online, attempt to set offline before logout
    if (status !== 'Offline') {
      workerApi.updateAvailability({ status: 'Offline', isOnline: false }).catch(() => {});
    }
    localStorage.removeItem('sahaai_worker_token');
    localStorage.removeItem('sahaai_worker_user');
    setUser(null);
    setProfile(null);
    setStatus('Offline');
    setCurrentCoords(null);
  };

  // Toggle Online/Offline
  const toggleOnline = async (): Promise<boolean> => {
    if (status === 'OnDuty') {
      throw new Error('Cannot change status while On Duty with an active job in progress.');
    }
    const nextStatus: WorkerStatus = status === 'Online' ? 'Offline' : 'Online';
    const nextIsOnline = nextStatus === 'Online';
    setStatus(nextStatus);
    try {
      await workerApi.updateAvailability({ status: nextStatus, isOnline: nextIsOnline });
      if (profile) {
        setProfile({ ...profile, status: nextStatus, isOnline: nextIsOnline });
      }
      return nextIsOnline;
    } catch (err) {
      // Revert on error
      setStatus(status);
      throw err;
    }
  };

  // Update Location
  const updateLocation = async (latitude: number, longitude: number) => {
    setCurrentCoords({ latitude, longitude });
    try {
      await workerApi.updateLocation({ latitude, longitude });
      setStatus((prev) => (prev === 'Offline' ? 'Online' : prev));
      if (profile) {
        setProfile({
          ...profile,
          isOnline: true,
          currentLatitude: latitude,
          currentLongitude: longitude,
        });
      }
    } catch (err) {
      console.warn('Failed to stream location to backend:', err);
    }
  };

  // Geolocation watch / interval
  useEffect(() => {
    if (!isAuthenticated || !isGpsTracking) return;

    // Send initial default location if none exists (e.g. Bangalore center 12.9716, 77.5946)
    if (!currentCoords) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateLocation(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // Default demo coordinates
            updateLocation(12.9716, 77.5946);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        updateLocation(12.9716, 77.5946);
      }
    }

    // Ping location every 30 seconds if online
    const interval = setInterval(() => {
      if (isOnline && currentCoords) {
        // Slight natural jitter or sync to keep cache alive
        updateLocation(currentCoords.latitude, currentCoords.longitude);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isGpsTracking, isOnline, currentCoords]);

  const toggleGpsTracking = () => {
    setIsGpsTracking((prev) => !prev);
  };

  return (
    <WorkerAuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoading,
        isOnline,
        status,
        currentCoords,
        isGpsTracking,
        login,
        register,
        logout,
        toggleOnline,
        updateLocation,
        toggleGpsTracking,
        refreshProfile,
      }}
    >
      {children}
    </WorkerAuthContext.Provider>
  );
};

export const useWorkerAuth = () => {
  const context = useContext(WorkerAuthContext);
  if (!context) {
    throw new Error('useWorkerAuth must be used within a WorkerAuthProvider');
  }
  return context;
};

