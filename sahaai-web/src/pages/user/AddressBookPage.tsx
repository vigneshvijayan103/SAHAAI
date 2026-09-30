import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Crosshair,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../features/location/locationSlice';
import { locationApi } from '../../api/locationApi';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import type { AddressResponseDto } from '../../types/location.types';

export const AddressBookPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { addresses, isLoading, error } = useAppSelector((state) => state.location);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponseDto | null>(null);

  // Form state
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number>(12.9716); // Default Bengaluru
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [isDefault, setIsDefault] = useState(false);

  // Status states
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coordsFromGps, setCoordsFromGps] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const resetForm = () => {
    setFullAddress('');
    setCity('');
    setState('');
    setPincode('');
    setLatitude(12.9716);
    setLongitude(77.5946);
    setIsDefault(false);
    setCoordsFromGps(false);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (addr: AddressResponseDto) => {
    setEditingAddress(addr);
    setFullAddress(addr.fullAddress);
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    setIsDefault(addr.isDefault);
    setCoordsFromGps(true);
    setFormError(null);
  };

  // Add address via GPS button: fetches current place details & auto-fills form
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsDetecting(true);
    setFormError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setCoordsFromGps(true);

        try {
          // Fetch place details from coordinates in background
          const res = await locationApi.reverseGeocode(lat, lon);
          if (res.data) {
            if (res.data.fullAddress) setFullAddress(res.data.fullAddress);
            if (res.data.city) setCity(res.data.city);
            if (res.data.state) setState(res.data.state);
            if (res.data.pincode) setPincode(res.data.pincode);
          }
        } catch {
          // Keep coordinates even if reverse lookup fails
        } finally {
          setGpsDetecting(false);
        }
      },
      () => {
        setFormError('Unable to access device location. Please enable location permissions or enter address manually.');
        setGpsDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      setFormError('Street address is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      let finalLat = latitude;
      let finalLon = longitude;

      // If user entered or modified address manually, automatically convert to coordinates in background
      if (!coordsFromGps || (city.trim() || fullAddress.trim() || pincode.trim())) {
        try {
          const geoRes = await locationApi.geocode({
            address: fullAddress.trim() || undefined,
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            pincode: pincode.trim() || undefined,
          });
          if (geoRes.data) {
            finalLat = geoRes.data.latitude;
            finalLon = geoRes.data.longitude;
          }
        } catch {
          // Proceed with current coordinates
        }
      }

      if (editingAddress) {
        // Update
        await dispatch(
          updateAddress({
            id: editingAddress.id,
            dto: {
              fullAddress: fullAddress.trim(),
              city: city.trim() || undefined,
              state: state.trim() || undefined,
              pincode: pincode.trim() || undefined,
              latitude: finalLat,
              longitude: finalLon,
              isDefault,
            },
          })
        );
        setEditingAddress(null);
      } else {
        // Add
        await dispatch(
          addAddress({
            fullAddress: fullAddress.trim(),
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            pincode: pincode.trim() || undefined,
            latitude: finalLat,
            longitude: finalLon,
            isDefault,
          })
        );
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      dispatch(deleteAddress(id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Address Book
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your saved physical locations for rapid emergency technician dispatch
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {isLoading && addresses.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Addresses Saved Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Add your primary residence or workplace so responders can locate you immediately.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-indigo-600 bg-white shadow-md shadow-indigo-50'
                  : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {addr.city || 'Saved Location'}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Default Address
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-2">
                  {addr.fullAddress}
                </p>

                {(addr.state || addr.pincode) && (
                  <p className="text-xs text-slate-400">
                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(addr)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Edit Address"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal - Single Clean Form */}
      <Modal
        isOpen={isAddModalOpen || !!editingAddress}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Auto-Fill via GPS Button */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Current Location</h4>
                <p className="text-[11px] text-slate-500">Auto-fill details from your device GPS</p>
              </div>
            </div>
            <button
              type="button"
              disabled={gpsDetecting}
              onClick={detectLocation}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {gpsDetecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Auto-filling...
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  Use GPS
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Street Address *
            </label>
            <textarea
              rows={3}
              value={fullAddress}
              onChange={(e) => {
                setFullAddress(e.target.value);
                setCoordsFromGps(false);
              }}
              placeholder="Flat/House No., Building Name, Street, Landmark, Area..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setCoordsFromGps(false);
                }}
                placeholder="e.g. Bengaluru"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCoordsFromGps(false);
                }}
                placeholder="e.g. Karnataka"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setCoordsFromGps(false);
                }}
                placeholder="e.g. 560001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Set as primary dispatch location (Default)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingAddress(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : editingAddress ? (
                'Save Changes'
              ) : (
                'Add Address'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

