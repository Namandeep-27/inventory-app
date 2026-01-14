'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { getInventory, getLocations } from '@/lib/api';
import { InventoryItem, Location } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Package, MapPin, Clock, Info, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SkeletonTableRow } from '@/components/SkeletonLoader';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

function InventoryContent() {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [locationFilter, setLocationFilter] = useState<string>(searchParams.get('location_id') || '');
  const [eventTypeToday, setEventTypeToday] = useState<string | null>(searchParams.get('event_type_today') || null);
  const [dateFrom, setDateFrom] = useState<string>(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState<string>(searchParams.get('date_to') || '');
  const [datePreset, setDatePreset] = useState<string>('');

  useEffect(() => {
    const status = searchParams.get('status') || '';
    const locationId = searchParams.get('location_id') || '';
    const eventType = searchParams.get('event_type_today') || null;
    const dateFromParam = searchParams.get('date_from') || '';
    const dateToParam = searchParams.get('date_to') || '';
    
    setStatusFilter(status);
    setLocationFilter(locationId);
    setEventTypeToday(eventType);
    setDateFrom(dateFromParam);
    setDateTo(dateToParam);
    
    // Auto-detect if date range matches a preset
    if (dateFromParam && dateToParam) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      if (dateFromParam === todayStr && dateToParam === todayStr) {
        setDatePreset('today');
      } else {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (dateFromParam === yesterdayStr && dateToParam === yesterdayStr) {
          setDatePreset('yesterday');
        } else {
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 6);
          const last7DaysStr = last7Days.toISOString().split('T')[0];
          
          if (dateFromParam === last7DaysStr && dateToParam === todayStr) {
            setDatePreset('last7days');
          } else {
            const last30Days = new Date(today);
            last30Days.setDate(last30Days.getDate() - 29);
            const last30DaysStr = last30Days.toISOString().split('T')[0];
            
            if (dateFromParam === last30DaysStr && dateToParam === todayStr) {
              setDatePreset('last30days');
            } else {
              setDatePreset('');
            }
          }
        }
      }
    } else {
      setDatePreset('');
    }
    
    // Load data with the current URL params
    const loadDataWithParams = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (status) params.status = status;
        if (locationId) params.location_id = locationId;
        if (eventType) params.event_type_today = eventType;
        if (dateFromParam) params.date_from = dateFromParam;
        if (dateToParam) params.date_to = dateToParam;
        
        const [invData, locData] = await Promise.all([getInventory(params), getLocations()]);
        setInventory(invData);
        setLocations(locData);
      } catch (error: any) {
        toast.error('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    
    loadDataWithParams();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (locationFilter) params.location_id = locationFilter;
      if (eventTypeToday) params.event_type_today = eventTypeToday;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const [invData, locData] = await Promise.all([getInventory(params), getLocations()]);
      setInventory(invData);
      setLocations(locData);
    } catch (error: any) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Date preset handlers
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    // Use local date, not UTC, to match server's local timezone expectations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let fromDate: Date;
    let toDate: Date;
    
    switch (preset) {
      case 'today':
        fromDate = new Date(today);
        toDate = new Date(today);
        break;
      case 'yesterday':
        fromDate = new Date(today);
        fromDate.setDate(fromDate.getDate() - 1);
        toDate = new Date(fromDate);
        break;
      case 'last7days':
        fromDate = new Date(today);
        fromDate.setDate(fromDate.getDate() - 6);
        toDate = new Date(today);
        break;
      case 'last30days':
        fromDate = new Date(today);
        fromDate.setDate(fromDate.getDate() - 29);
        toDate = new Date(today);
        break;
      default:
        setDateFrom('');
        setDateTo('');
        setDatePreset('');
        // loadData will be called by useEffect when dateFrom/dateTo change
        return;
    }
    
    // Format as YYYY-MM-DD using local date components (not UTC)
    // This ensures the date string represents the local date, not UTC date
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const fromStr = formatLocalDate(fromDate);
    const toStr = formatLocalDate(toDate);
    
    setDateFrom(fromStr);
    setDateTo(toStr);
  };

  // Update data when filters change (but not on initial mount to avoid double load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, locationFilter, eventTypeToday, dateFrom, dateTo]);

  const filteredInventory = inventory.filter((item) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !item.box_id.toLowerCase().includes(searchLower) &&
        !item.product.brand.toLowerCase().includes(searchLower) &&
        !item.product.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    // Note: status and location filters are already applied on backend when event_type_today is used
    // But we still apply them here for consistency when event_type_today is not used
    if (!eventTypeToday && statusFilter && item.status !== statusFilter) {
      return false;
    }
    if (!eventTypeToday && locationFilter && item.current_location?.location_id !== locationFilter) {
      return false;
    }
    return true;
  });

  // Get contextual title and description based on filters
  const getPageTitle = () => {
    if (eventTypeToday === 'IN') return 'Boxes Received Today';
    if (eventTypeToday === 'MOVE') return 'Boxes Moved Today';
    if (eventTypeToday === 'OUT') return 'Boxes Shipped Today';
    if (locationFilter && locations.length > 0) {
      const location = locations.find(loc => loc.location_id === locationFilter);
      if (location) return `Inventory at ${location.location_code}`;
    }
    return 'Inventory';
  };

  const getPageDescription = () => {
    if (eventTypeToday === 'IN') return 'View all boxes that were received (scanned IN) today.';
    if (eventTypeToday === 'MOVE') return 'View all boxes that were moved (put-away scans) today.';
    if (eventTypeToday === 'OUT') return 'View all boxes that were shipped (scanned OUT) today.';
    if (locationFilter && statusFilter === 'IN_STOCK') {
      return 'View boxes currently in stock at this location.';
    }
    return 'View and search your complete inventory. See all boxes currently in stock, their locations, and status.';
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={getPageTitle()}
          subtitle={getPageDescription()}
        />

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
              <p className="font-semibold mb-2 text-blue-900">Quick tips:</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-blue-800">
                <li>Search by box ID, brand, or product name</li>
                <li>Filter by status (In Stock / Out of Warehouse) to see what's available</li>
                <li>Filter by location to find all boxes at a specific shelf</li>
                <li>Use date filters to find boxes by when their last event occurred</li>
                <li>Click any box ID to view its complete history and details</li>
                <li>Boxes at "RECEIVING" location need to be moved to shelves</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Box ID, brand, or product name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="OUT_OF_WAREHOUSE">Out of Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All</option>
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.location_code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter Section */}
          <div className="border-t border-slate-200 pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Filter by Date
            </label>
            
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleDatePreset('today')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  datePreset === 'today'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Today
              </button>
              <button
                onClick={() => handleDatePreset('yesterday')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  datePreset === 'yesterday'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Yesterday
              </button>
              <button
                onClick={() => handleDatePreset('last7days')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  datePreset === 'last7days'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handleDatePreset('last30days')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  datePreset === 'last30days'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handleDatePreset('clear')}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
              >
                Clear
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setDatePreset('');
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setDatePreset('');
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Lot Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Last Event
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Box ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Lot Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Last Event
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredInventory.map((item, index) => (
                  <motion.tr
                    key={item.box_id}
                    className="hover:bg-slate-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/boxes/${item.box_id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        {item.box_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.product.brand} - {item.product.name}
                      </div>
                      {item.product.size && (
                        <div className="text-sm text-slate-600">{item.product.size}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.lot_code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full',
                          item.status === 'IN_STOCK'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {item.status === 'IN_STOCK' ? 'In Stock' : 'Out of Warehouse'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.current_location?.location_code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-2">
                      {item.last_event_time && (
                        <>
                          <Clock className="w-4 h-4 text-slate-400" />
                          {new Date(item.last_event_time).toLocaleString()}
                        </>
                      )}
                      {!item.last_event_time && '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900 mb-2">No inventory found</p>
                <p className="text-sm text-slate-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <PageTransition>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        </div>
      </PageTransition>
    }>
      <InventoryContent />
    </Suspense>
  );
}
