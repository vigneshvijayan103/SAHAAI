import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Navigation,
  Clock,
  Radio,
  Compass,
  Maximize2,
  Phone,
  UserCheck,
} from 'lucide-react';

interface LiveWorkerTrackerProps {
  customerLat?: number | null;
  customerLng?: number | null;
  customerAddress?: string;
  workerLat?: number | null;
  workerLng?: number | null;
  workerName?: string | null;
  workerPhone?: string | null;
  workerPhoto?: string | null;
  status: string; // 'Accepted' | 'InProgress' | 'Completed' | etc.
}

// Calculate Haversine distance in kilometers
function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export const LiveWorkerTracker: React.FC<LiveWorkerTrackerProps> = ({
  customerLat,
  customerLng,
  customerAddress,
  workerLat,
  workerLng,
  workerName,
  workerPhone,
  workerPhoto,
  status,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const hasWorkerCoords = typeof workerLat === 'number' && typeof workerLng === 'number' && workerLat !== 0 && workerLng !== 0;
  const hasCustomerCoords = typeof customerLat === 'number' && typeof customerLng === 'number' && customerLat !== 0 && customerLng !== 0;

  // Calculate distance & ETA
  const distanceKm = useMemo(() => {
    if (hasWorkerCoords && hasCustomerCoords) {
      return calculateHaversine(workerLat!, workerLng!, customerLat!, customerLng!);
    }
    return null;
  }, [hasWorkerCoords, hasCustomerCoords, workerLat, workerLng, customerLat, customerLng]);

  const etaMinutes = useMemo(() => {
    if (!distanceKm) return null;
    // Assuming urban emergency transit speed of ~25 km/h + 2 min buffer
    const minutes = Math.round((distanceKm / 25) * 60 + 2);
    return Math.max(1, minutes);
  }, [distanceKm]);

  // Update timestamp when worker coordinates change
  useEffect(() => {
    if (hasWorkerCoords) {
      setLastUpdated(new Date());
    }
  }, [workerLat, workerLng, hasWorkerCoords]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center fallback (India center or available coords)
    const initialCenterLat = workerLat || customerLat || 12.9716;
    const initialCenterLng = workerLng || customerLng || 77.5946;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialCenterLat, initialCenterLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Customer Marker Icon
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
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

    // Custom Worker Marker Icon
    const workerIcon = L.divIcon({
      className: 'custom-worker-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; background-color: rgba(16, 185, 129, 0.35); border-radius: 9999px; animation: pulse 1.5s infinite;"></div>
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Update or add Customer Marker
    if (hasCustomerCoords) {
      const customerPos: L.LatLngExpression = [customerLat!, customerLng!];
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = L.marker(customerPos, { icon: customerIcon })
          .addTo(map)
          .bindPopup(
            `<b>Your Location</b><br/><span style="font-size: 11px; color: #4b5563;">${customerAddress || 'Destination point'}</span>`
          );
      } else {
        customerMarkerRef.current.setLatLng(customerPos);
      }
    }

    // Update or add Worker Marker
    if (hasWorkerCoords) {
      const workerPos: L.LatLngExpression = [workerLat!, workerLng!];
      if (!workerMarkerRef.current) {
        workerMarkerRef.current = L.marker(workerPos, { icon: workerIcon })
          .addTo(map)
          .bindPopup(
            `<b>${workerName || 'Technician'}</b><br/><span style="font-size: 11px; color: #059669;">Live GPS En Route</span>`
          );
      } else {
        workerMarkerRef.current.setLatLng(workerPos);
      }
    }

    // Update Route Line & Bounds
    if (hasWorkerCoords && hasCustomerCoords) {
      const linePoints: L.LatLngExpression[] = [
        [workerLat!, workerLng!],
        [customerLat!, customerLng!],
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(linePoints, {
          color: '#10b981',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(linePoints);
      }

      // Auto fit bounds to show both pins
      const bounds = L.latLngBounds([
        [workerLat!, workerLng!],
        [customerLat!, customerLng!],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (hasWorkerCoords) {
      map.setView([workerLat!, workerLng!], 15);
    } else if (hasCustomerCoords) {
      map.setView([customerLat!, customerLng!], 15);
    }

    // Clean-up on unmount
    return () => {
      // Keep map alive for subsequent updates
    };
  }, [customerLat, customerLng, customerAddress, workerLat, workerLng, workerName, hasWorkerCoords, hasCustomerCoords]);

  // Recenter button action
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (hasWorkerCoords && hasCustomerCoords) {
      const bounds = L.latLngBounds([
        [workerLat!, workerLng!],
        [customerLat!, customerLng!],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (hasWorkerCoords) {
      mapInstanceRef.current.setView([workerLat!, workerLng!], 15);
    } else if (hasCustomerCoords) {
      mapInstanceRef.current.setView([customerLat!, customerLng!], 15);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">Live Technician Tracking</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {status.toLowerCase() === 'inprogress'
                ? 'Technician is actively working on-site'
                : 'Technician is en route with real-time telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* Telemetry KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-200">
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            Distance
          </div>
          <p className="text-lg font-black text-slate-900">
            {distanceKm !== null ? `${distanceKm.toFixed(1)} km` : hasWorkerCoords ? 'Calculating...' : 'Locating...'}
          </p>
          <span className="text-[10px] text-slate-500">Straight-line distance</span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Est. Arrival
          </div>
          <p className="text-lg font-black text-slate-900">
            {status.toLowerCase() === 'inprogress'
              ? 'On Site'
              : etaMinutes !== null
              ? `~${etaMinutes} mins`
              : 'En Route'}
          </p>
          <span className="text-[10px] text-slate-500">
            {status.toLowerCase() === 'inprogress' ? 'Service started' : 'Subject to city traffic'}
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
            Tech Status
          </div>
          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            {status.toLowerCase() === 'inprogress' ? 'Working On Site' : 'Moving to Destination'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {workerName || 'Assigned Technician'}
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 text-amber-600" />
            Last GPS Beacon
          </div>
          <p className="text-xs font-semibold text-slate-800 mt-1 font-mono">
            {lastUpdated.toLocaleTimeString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Signal Connected</span>
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Overlay if Waiting for Worker GPS */}
        {!hasWorkerCoords && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
            <div className="bg-white/95 p-5 rounded-2xl border border-slate-200 shadow-xl max-w-sm text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-2.5 text-emerald-600 animate-pulse">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Acquiring Technician's GPS Beacon
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The technician has accepted your request. Real-time GPS coordinates will sync as soon as the technician transmits their beacon.
              </p>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md z-10 flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
            <span className="text-slate-700 text-[11px]">Technician</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span>
            <span className="text-slate-700 text-[11px]">Your Address</span>
          </div>
        </div>
      </div>

      {/* Bottom Technician Info Mini-Bar */}
      {workerName && (
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden border border-emerald-400/40 shrink-0">
              {workerPhoto ? (
                <img src={workerPhoto} alt={workerName} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{workerName}</h4>
              <p className="text-[11px] text-slate-500">
                {workerPhone ? `Contact: ${workerPhone}` : 'Verified Sahaai Partner'}
              </p>
            </div>
          </div>

          {workerPhone && (
            <a
              href={`tel:${workerPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Technician</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
