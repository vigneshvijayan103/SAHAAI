import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wrench,
  FileText,
  Mic,
  Camera,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServices, selectServiceById } from '../../features/services/serviceSlice';
import { fetchAddresses } from '../../features/location/locationSlice';
import { createServiceRequest } from '../../features/serviceRequest/serviceRequestSlice';
import { VoiceRecorder } from '../../components/audio/VoiceRecorder';
import { Spinner } from '../../components/common/Spinner';

export const CreateRequestWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const searchParams = new URLSearchParams(location.search);
  const paramServiceId = searchParams.get('serviceId');

  const { services } = useAppSelector((state) => state.services);
  const { addresses } = useAppSelector((state) => state.location);
  const { isSubmitting, error } = useAppSelector((state) => state.serviceRequest);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    paramServiceId ? parseInt(paramServiceId, 10) : 0
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (paramServiceId) {
      const id = parseInt(paramServiceId, 10);
      setSelectedServiceId(id);
      dispatch(selectServiceById(id));
    }
  }, [paramServiceId, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // Handle image upload & previews
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...imageFiles, ...newFiles].slice(0, 5); // Limit 5
      setImageFiles(combined);

      const previews = combined.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const validateStep = (step: number): boolean => {
    setFormError(null);
    if (step === 1) {
      if (!selectedServiceId) {
        setFormError('Please select a service category.');
        return false;
      }
    }
    if (step === 2) {
      if (!title.trim()) {
        setFormError('Please provide a brief title for your request.');
        return false;
      }
    }
    if (step === 5) {
      if (!selectedAddressId) {
        setFormError('Please select a dispatch location.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setFormError(null);

    try {
      const result = await dispatch(
        createServiceRequest({
          serviceId: selectedServiceId,
          title: title.trim(),
          description: description.trim() || undefined,
          addressId: selectedAddressId,
          imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
          audioFile: audioFile || undefined,
        })
      );

      if (createServiceRequest.fulfilled.match(result)) {
        const payload = result.payload as any;
        const reqId = Number(
          payload?.requestId ||
          payload?.RequestId ||
          payload?.data?.requestId ||
          payload?.data?.RequestId ||
          payload?.id ||
          payload?.Id ||
          0
        );
        if (reqId > 0) {
          navigate(`/request/${reqId}`);
        } else {
          setFormError('Failed to retrieve request ID from backend.');
        }
      } else {
        setFormError((result.payload as string) || 'Failed to create service request.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const steps = [
    { num: 1, label: 'Service', icon: <Wrench className="w-4 h-4" /> },
    { num: 2, label: 'Details', icon: <FileText className="w-4 h-4" /> },
    { num: 3, label: 'Voice Note', icon: <Mic className="w-4 h-4" /> },
    { num: 4, label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { num: 5, label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { num: 6, label: 'Confirm', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                      : currentStep > s.num
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-300'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <CheckCircle className="w-4 h-4" /> : s.icon}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-bold mt-1.5 hidden sm:block ${
                    currentStep === s.num ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded ${
                    currentStep > s.num ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[420px] flex flex-col justify-between">
        {(formError || error) && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* STEP 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Choose Service Category</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the certified emergency assistance you require
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                    selectedServiceId === service.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img
                    src={service.imageUrl || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=100&auto=format&fit=crop&q=80'}
                    alt={service.serviceName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {service.serviceName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Title & Description */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Describe the Issue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explain the emergency so the technician arrives with proper tools
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Request Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kitchen pipe burst and leaking under sink"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Description (Optional)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional details such as floor number, access instructions, or severity..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Voice Note Recording */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Record a Voice Note</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Speak directly to explain the issue rapidly if typing is inconvenient
              </p>
            </div>

            <VoiceRecorder onAudioRecorded={(file) => setAudioFile(file)} />

            {audioFile && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Voice note recorded and attached successfully!
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Photo Evidence Upload */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Photos (Optional)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add photos of the damage or breakdown area (Up to 5 images)
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  Click to select photos from device
                </span>
                <span className="text-xs text-slate-400">PNG, JPG, JPEG up to 10MB</span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg shadow opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Address Selection */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Dispatch Address</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Technicians will be dispatched to this physical location
                </p>
              </div>
              <Link
                to="/addresses"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No saved addresses found</p>
                <p className="text-xs text-slate-500 mb-4">Please add an address to proceed</p>
                <Link
                  to="/addresses"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Manage & Add Addresses
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <MapPin
                      className={`w-5 h-5 mt-0.5 ${
                        selectedAddressId === addr.id ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {addr.city || 'Address'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.fullAddress}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        GPS: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Review & Confirmation */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Review & Confirm Dispatch</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify details before initiating 5km radar dispatch
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500">Service Category</span>
                <span className="font-bold text-slate-900">{selectedService?.serviceName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500">Title</span>
                <span className="font-bold text-slate-900 text-right">{title}</span>
              </div>

              {description && (
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Details</span>
                  <p className="text-xs text-slate-700">{description}</p>
                </div>
              )}

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500">Dispatch Location</span>
                <span className="font-bold text-slate-900 text-right max-w-xs truncate">
                  {selectedAddress?.fullAddress}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500">Voice Note</span>
                <span className="font-bold text-slate-900">
                  {audioFile ? 'Attached (1 file)' : 'None'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs font-semibold text-slate-500">Photos Attached</span>
                <span className="font-bold text-slate-900">
                  {imageFiles.length > 0 ? `${imageFiles.length} file(s)` : 'None'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
              <p className="text-xs font-medium text-indigo-900">
                Submitting will activate a 5km radius worker search.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <>
                  Find Workers..
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

