'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getLocations, createLocation } from '@/lib/api';
import { Location } from '@/lib/types';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Info, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

export default function LocationsPage() {
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    zone: '',
    aisle: '',
    rack: '',
    shelf: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/scan');
      return;
    }
    loadLocations();
  }, [isAdmin, router]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error: any) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLocation = await createLocation(formData);
      setLocations([...locations, newLocation]);
      setShowCreate(false);
      setFormData({ zone: '', aisle: '', rack: '', shelf: '' });
      toast.success('Location created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create location');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Locations"
          subtitle="Manage warehouse storage locations. Each location has a unique QR code that can be printed and attached to shelves for scanning during box movements."
        >
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl',
              'hover:bg-blue-700 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCreate ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Location
              </>
            )}
          </motion.button>
        </PageHeader>

        <motion.div
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2 text-blue-900">Location setup workflow:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
                <li>Create locations for all shelf positions in your warehouse</li>
                <li>Print each location's QR code from the card below</li>
                <li>Attach printed QR codes to the corresponding physical shelf locations</li>
                <li>Use these QR codes when moving boxes to shelves (MOVE workflow)</li>
                <li><strong>Note:</strong> Once QR codes are printed and attached, you'll rarely need to access this page</li>
              </ol>
            </div>
        </div>
        </motion.div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Location</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Zone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Aisle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.aisle}
                      onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Rack <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.rack}
                      onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Shelf <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shelf}
                      onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 mb-6">Location code will be auto-generated as: ZoneAisle-Rack-Shelf</p>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Location
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {locations.map((location, index) => (
              <motion.div
                key={location.location_id}
                className="location-print-card bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all"
                data-location-id={location.location_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-900">{location.location_code}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Zone {location.zone} • Aisle {location.aisle} • Rack {location.rack} • Shelf {location.shelf}
                    </p>
                    {location.is_system_location && (
                      <span className="inline-block px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
                        System Location
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                  <div className="flex justify-center">
                  <QRCodeDisplay value={`LOC:${location.location_code}`} size={200} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-3">Print this QR code and attach to shelf</p>
                  <motion.button
                    onClick={() => {
                      // Mark this card as the one to print
                      const allCards = document.querySelectorAll('.location-print-card');
                      allCards.forEach(card => {
                        card.classList.remove('print-this-location');
                      });
                      const currentCard = document.querySelector(`[data-location-id="${location.location_id}"]`);
                      if (currentCard) {
                        currentCard.classList.add('print-this-location');
                      }
                      window.print();
                    }}
                    className="no-print inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Print QR Code
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!loading && locations.length === 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-semibold text-slate-900 mb-2">No locations found</p>
            <p className="text-sm text-slate-600">Create your first location to start organizing your warehouse</p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
