import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from '../../features/services/serviceSlice';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import type { ServiceResponseDto } from '../../types/service.types';

export const AdminServicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { services, isLoading, error } = useAppSelector((state) => state.services);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponseDto | null>(null);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const resetForm = () => {
    setServiceName('');
    setDescription('');
    setImageFile(null);
    setIsActive(true);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (service: ServiceResponseDto) => {
    setEditingService(service);
    setServiceName(service.serviceName);
    setDescription(service.description || '');
    setImageFile(null);
    setIsActive(service.isActive);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setFormError('Service name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingService) {
        // Update
        await dispatch(
          updateService({
            id: editingService.id,
            dto: {
              serviceName: serviceName.trim(),
              description: description.trim() || undefined,
              image: imageFile || undefined,
              isActive,
            },
          })
        );
        setEditingService(null);
      } else {
        // Create
        await dispatch(
          createService({
            serviceName: serviceName.trim(),
            description: description.trim() || undefined,
            image: imageFile || undefined,
          })
        );
        setIsAddModalOpen(false);
      }
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to deactivate/delete this service?')) {
      dispatch(deleteService(id));
    }
  };

  const filteredServices = services.filter((s) =>
    s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Wrench className="w-3.5 h-3.5" />
            Admin Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Service Catalog Manager
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add, modify, and manage field service categories available on the platform
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter catalog items..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <span className="text-xs font-semibold text-slate-400 hidden sm:block">
          Total Services: {filteredServices.length}
        </span>
      </div>

      {/* Table / List View */}
      {isLoading && services.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            service.imageUrl ||
                            'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=80&auto=format&fit=crop&q=80'
                          }
                          alt={service.serviceName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{service.serviceName}</p>
                          <span className="text-[11px] font-mono text-slate-400">ID #{service.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {service.description || 'No description'}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      {service.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingService}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
        }}
        title={editingService ? 'Edit Service Details' : 'Add New Service Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Electrical Emergency"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the scope and emergency readiness for this service..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Service Thumbnail Image
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="service-image"
                className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-4 h-4" />
                {imageFile ? imageFile.name : 'Choose Image File'}
              </label>
              <input
                type="file"
                id="service-image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {imageFile && (
                <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-xs">
                  Ready to upload
                </span>
              )}
            </div>
          </div>

          {editingService && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="serviceActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="serviceActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Catalog Item is Active for Customer Requests
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingService(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 disabled:opacity-50"
            >
              {isSubmitting ? <Spinner size="sm" color="text-white" /> : editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

