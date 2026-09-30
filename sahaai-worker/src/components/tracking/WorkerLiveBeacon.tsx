import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Radio,
  Navigation,
  Compass,
  MapPin,
  Play,
  Pause,
  FastForward,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { workerApi } from '../../api/workerApi';

interface WorkerLiveBeaconProps {
  destinationLat?: number | null;
  destinationLng?: number | null;
  destinationAddress?: string | null;
  requestId: number;
  status: string; // 'Accepted' | 'InProgress'
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const WorkerLiveBeacon: React.FC<WorkerLiveBeaconProps> = ({
  destinationLat,
  destinationLng,
  destinationAddress,
  status,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isAutoDriving, setIsAutoDriving] = useState<boolean>(false);
  const autoDriveTimerRef = useRef<any>(null);

  const hasDest = typeof destinationLat === 'number' && typeof destinationLng === 'number' && destinationLat !== 0 && destinationLng !== 0;

  // Transmit location to backend
  const broadcastLocation = async (lat: number, lng: number) => {
    setIsTransmitting(true);
    try {
      await workerApi.updateLocation({ latitude: lat, longitude: lng });
      setCurrentPos({ lat, lng });
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Failed to transmit location beacon:', err);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Obtain initial real GPS or start near destination if sitting at desk
  useEffect(() => {
    let watchId: number | null = null;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          broadcastLocation(lat, lng);
        },
        (err) => {
          console.warn('Geolocation initial query error:', err);
          // If real GPS denied and destination available, spawn ~2.5km southwest for realistic simulation
          if (hasDest && !currentPos) {
            const initialLat = destinationLat! - 0.02;
            const initialLng = destinationLng! - 0.02;
            broadcastLocation(initialLat, initialLng);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // If not currently auto-simulating, send real GPS updates
          if (!isAutoDriving) {
            broadcastLocation(pos.coords.latitude, pos.coords.longitude);
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else if (hasDest && !currentPos) {
      const initialLat = destinationLat! - 0.02;
      const initialLng = destinationLng! - 0.02;
      broadcastLocation(initialLat, initialLng);
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [hasDest, destinationLat, destinationLng, isAutoDriving]);

  // Periodic heartbeat every 15s to keep location fresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPos && !isAutoDriving) {
        broadcastLocation(currentPos.lat, currentPos.lng);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentPos, isAutoDriving]);

  // Step simulation closer to destination
  const handleSimulateStep = () => {
    if (!hasDest) return;

    let startLat = currentPos?.lat;
    let startLng = currentPos?.lng;

    if (!startLat || !startLng) {
      startLat = destinationLat! - 0.025;
      startLng = destinationLng! - 0.025;
    }

    // Move ~25% closer to destination
    const deltaLat = destinationLat! - startLat;
    const deltaLng = destinationLng! - startLng;

    // Check if already extremely close (< 20 meters)
    if (Math.abs(deltaLat) < 0.0002 && Math.abs(deltaLng) < 0.0002) {
      broadcastLocation(destinationLat!, destinationLng!);
      setIsAutoDriving(false);
      return;
    }

    const nextLat = startLat + deltaLat * 0.25;
    const nextLng = startLng + deltaLng * 0.25;

    broadcastLocation(nextLat, nextLng);
  };

  // Auto-drive simulation timer (moves worker closer every 3 seconds)
  useEffect(() => {
    if (isAutoDriving) {
      autoDriveTimerRef.current = setInterval(() => {
        handleSimulateStep();
      }, 3000);
    } else {
      if (autoDriveTimerRef.current) {
        clearInterval(autoDriveTimerRef.current);
        autoDriveTimerRef.current = null;
      }
    }

    return () => {
      if (autoDriveTimerRef.current) {
        clearInterval(autoDriveTimerRef.current);
      }
    };
  }, [isAutoDriving, currentPos, hasDest, destinationLat, destinationLng]);

  // Distance computation
  const distanceRemainingKm = useMemo(() => {
    if (currentPos && hasDest) {
      return calculateDistanceKm(currentPos.lat, currentPos.lng, destinationLat!, destinationLng!);
    }
    return null;
  }, [currentPos, hasDest, destinationLat, destinationLng]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenterLat = currentPos?.lat || destinationLat || 12.9716;
    const initialCenterLng = currentPos?.lng || destinationLng || 77.5946;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialCenterLat, initialCenterLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Technician Pin Icon
    const techIcon = L.divIcon({
      className: 'tech-beacon-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; background-color: rgba(245, 158, 11, 0.35); border-radius: 9999px; animation: pulse 1.5s infinite;"></div>
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #020617; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Destination Pin Icon
    const destIcon = L.divIcon({
      className: 'dest-beacon-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(59, 130, 246, 0.25); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); border: 2.5px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (currentPos) {
      const pos: L.LatLngExpression = [currentPos.lat, currentPos.lng];
      if (!workerMarkerRef.current) {
        workerMarkerRef.current = L.marker(pos, { icon: techIcon })
          .addTo(map)
          .bindPopup('<b>You (Technician)</b><br/><span style="font-size: 11px;">Broadcasting Live GPS</span>');
      } else {
        workerMarkerRef.current.setLatLng(pos);
      }
    }

    if (hasDest) {
      const pos: L.LatLngExpression = [destinationLat!, destinationLng!];
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker(pos, { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Customer Destination</b><br/><span style="font-size: 11px;">${destinationAddress || 'Site'}</span>`);
      } else {
        destMarkerRef.current.setLatLng(pos);
      }
    }

    // Route line & bounds
    if (currentPos && hasDest) {
      const points: L.LatLngExpression[] = [
        [currentPos.lat, currentPos.lng],
        [destinationLat!, destinationLng!],
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(points, {
          color: '#f59e0b',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(points);
      }

      const bounds = L.latLngBounds([
        [currentPos.lat, currentPos.lng],
        [destinationLat!, destinationLng!],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (currentPos) {
      map.setView([currentPos.lat, currentPos.lng], 15);
    }
  }, [currentPos, hasDest, destinationLat, destinationLng, destinationAddress]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (currentPos && hasDest) {
      const bounds = L.latLngBounds([
        [currentPos.lat, currentPos.lng],
        [destinationLat!, destinationLng!],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (currentPos) {
      mapInstanceRef.current.setView([currentPos.lat, currentPos.lng], 15);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header telemetry status */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">Live GPS Beacon Transmitting</h3>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Customer is tracking your route live via real-time SignalR telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Recenter Map</span>
          </button>
        </div>
      </div>

      {/* Telemetry Numbers Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/60 border-b border-slate-800">
        <div className="p-3.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>Distance to Customer</span>
          </div>
          <p className="text-base font-extrabold text-white">
            {distanceRemainingKm !== null ? `${distanceRemainingKm.toFixed(1)} km` : 'Acquiring...'}
          </p>
          <span className="text-[10px] text-slate-500">Remaining en route</span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mission Phase</span>
          </div>
          <p className="text-xs font-bold text-amber-300 mt-0.5">
            {status === 'InProgress' ? 'Working On Site' : 'Navigating to Site'}
          </p>
          <span className="text-[10px] text-slate-500">GPS high-accuracy</span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Last Broadcast</span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">
            {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Syncing...'}
          </p>
          <span className="text-[10px] text-emerald-400">
            {isTransmitting ? 'Transmitting packet...' : 'Signal live'}
          </span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Your GPS Coordinates</span>
          </div>
          <p className="text-[11px] font-mono font-bold text-slate-300 truncate mt-0.5">
            {currentPos ? `${currentPos.lat.toFixed(4)}, ${currentPos.lng.toFixed(4)}` : 'Detecting...'}
          </p>
          <span className="text-[10px] text-slate-500">Broadcast to user</span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg z-10 flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-slate-900 shadow-sm"></span>
            <span className="text-slate-300 text-[11px]">Your Position</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-slate-900 shadow-sm"></span>
            <span className="text-slate-300 text-[11px]">Customer Destination</span>
          </div>
        </div>
      </div>

      {/* Simulation & Movement Controls for Testing & Real-time Demos */}
      <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Movement Simulator:
          </span>
          <span className="text-xs text-slate-500">
            (Use to test customer live tracking in real time)
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleSimulateStep}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Simulate 1 Step Closer</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoDriving(!isAutoDriving)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isAutoDriving
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isAutoDriving ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Drive</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Drive (Live GPS stream)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

