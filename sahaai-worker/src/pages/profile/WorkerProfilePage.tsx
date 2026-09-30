import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import { workerApi } from '../../api/workerApi';

export const WorkerProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useWorkerAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setPhotoPreview(profile.photoUrl || null);
    }
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData();
    if (fullName.trim()) formData.append('FullName', fullName.trim());
    if (phone.trim()) formData.append('Phone', phone.trim());
    if (photo) formData.append('Photo', photo);

    try {
      await workerApi.updateProfile(formData);
      await refreshProfile();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const maskedAadhaar = profile?.aadhaarNumber
    ? `XXXX-XXXX-${profile.aadhaarNumber.slice(-4)}`
    : 'Not Available';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>Technician Profile & Credentials</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage your identity, contact details, and field credentials.</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ID Badge Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-amber-950/30 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl bg-slate-950 shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-white">{profile?.fullName}</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Partner</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">@{profile?.username} &bull; Worker ID #{profile?.workerId}</p>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-300">
            <span className="flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">Aadhaar: {maskedAadhaar}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile?.email}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Edit Personal Information</h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Update Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

