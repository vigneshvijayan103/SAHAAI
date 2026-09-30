import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { signalRService } from '../../services/signalrService';
import { apiClient } from '../../api/client';

export const AuthSessionWatcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }

    const userId = user.userId;

    // 1. Ensure SignalR connection is active and user group is joined
    signalRService.startConnection(userId);

    // 2. Real-time ForceLogout listener via SignalR
    const handleForceLogout = (payload?: any) => {
      console.warn('[AuthSession] Real-time ForceLogout event received:', payload);
      dispatch(logout());
      navigate('/login?deactivated=true');
    };

    signalRService.on('ForceLogout', handleForceLogout);

    // 3. Periodic status check & window focus check
    const checkActiveStatus = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      try {
        await apiClient.get('/UserAuth/status');
      } catch (err: any) {
        // If 401 occurred, apiClient response interceptor already cleared storage and redirected.
        // Also dispatch Redux logout to keep state in sync
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('deactivated') || msg.includes('unauthorized')) {
          dispatch(logout());
          navigate('/login?deactivated=true');
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Heartbeat every 10 seconds
    const intervalId = setInterval(checkActiveStatus, 10000);

    // Immediate check when window regains focus
    const handleFocus = () => {
      checkActiveStatus();
    };
    window.addEventListener('focus', handleFocus);

    // Cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sahaai_token' && !e.newValue) {
        dispatch(logout());
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      signalRService.off('ForceLogout', handleForceLogout);
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, user?.userId, dispatch, navigate]);

  return null;
};

