'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import QRScanner from '@/components/QRScanner';
import WorkStatusBanner from '@/components/WorkStatusBanner';
import PutawayTaskList from '@/components/PutawayTaskList';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import WorkflowMetrics from '@/components/WorkflowMetrics';
import ScanConfirmationCard from '@/components/ScanConfirmationCard';
import PageHeader from '@/components/PageHeader';
import ActionCard from '@/components/ActionCard';
import LocationOccupancyDialog from '@/components/LocationOccupancyDialog';
import { Mode, Location, BoxDetails, Event } from '@/lib/types';
import { createEvent, undoEvent, getBox, getLocations, getLocationOccupancy, LocationOccupancy } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Download, Upload, Move, Camera, RotateCcw, ArrowLeft, ArrowRight, QrCode, MapPin, Package } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';
import { useStats } from '@/hooks/useStats';

export default function ScanPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
  const [pendingLocationCode, setPendingLocationCode] = useState<string | null>(null);
  const [moveStep, setMoveStep] = useState<1 | 2>(1);
  const [lastEvent, setLastEvent] = useState<Event | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [boxDetails, setBoxDetails] = useState<BoxDetails | null>(null);
  const { stats } = useStats();
  const toPutAway = stats?.to_put_away ?? 0;
  const processingBoxRef = useRef<Set<string>>(new Set());
  const [occupancyDialogOpen, setOccupancyDialogOpen] = useState(false);
  const [occupancy, setOccupancy] = useState<LocationOccupancy | null>(null);
  const [checkingOccupancy, setCheckingOccupancy] = useState(false);
  const [pendingLocationForOccupancy, setPendingLocationForOccupancy] = useState<Location | null>(null);
  const [lastScannedType, setLastScannedType] = useState<'box' | 'location' | null>(null);
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [wrongScanTypeWarning, setWrongScanTypeWarning] = useState<{ expected: 'box' | 'location'; received: 'box' | 'location' } | null>(null);

  // Stats are now fetched via useStats hook - no need for separate fetch

  useEffect(() => {
    // Reset when mode changes
    if (mode !== 'MOVE') {
      setPendingLocation(null);
      setPendingLocationCode(null);
      setMoveStep(1);
    } else {
      setMoveStep(1);
      setPendingLocation(null);
      setPendingLocationCode(null);
    }
    // Reset camera when mode changes
    setCameraActive(false);
    // Clear undo state on mode change
    setLastEventId(null);
  }, [mode]);

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setCameraActive(false);
    setLastEvent(null);
    setLastEventId(null);
    setBoxDetails(null);
  };

  const handleStartCamera = () => {
    if (!mode) {
      toast.error('Please select an action first');
      return;
    }
    // Clear previous scan results when starting a new scan
    setLastEvent(null);
    setLastEventId(null);
    setBoxDetails(null);
    // Reset MOVE mode state if starting a new scan
    if (mode === 'MOVE') {
      setPendingLocation(null);
      setPendingLocationCode(null);
      setMoveStep(1);
    }
    setCameraActive(true);
  };

  const handleStopCamera = () => {
    setCameraActive(false);
  };

  const handleLocationScan = async (locationCode: string) => {
    if (pendingLocationCode === locationCode) {
      return;
    }

    try {
      // Fetch location details
      const locations = await getLocations();
      const location = locations.find((loc) => loc.location_code === locationCode);
      
      if (!location) {
        toast.error(`Location not found: ${locationCode}`);
        return;
      }

      // Check occupancy
      setCheckingOccupancy(true);
      try {
        const occupancyData = await getLocationOccupancy(location.location_id);
        setOccupancy(occupancyData);
        
        if (occupancyData.active_box_count > 0) {
          // Show warning dialog
          setPendingLocationForOccupancy(location);
          setOccupancyDialogOpen(true);
          setCheckingOccupancy(false);
          return;
        }
      } catch (error) {
        console.error('Failed to check occupancy:', error);
        // Continue anyway if occupancy check fails
      }
      setCheckingOccupancy(false);

      // No occupancy or check failed - proceed normally
      setPendingLocation(location);
      setPendingLocationCode(locationCode);
      setMoveStep(2);
      toast.success(`Location locked: ${locationCode}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.message || 'Failed to fetch location');
      setCheckingOccupancy(false);
    }
  };

  const handleAssignAnyway = () => {
    if (pendingLocationForOccupancy) {
      setPendingLocation(pendingLocationForOccupancy);
      setPendingLocationCode(pendingLocationForOccupancy.location_code);
      setMoveStep(2);
      
      // Update last scanned info for ScanCoach
      setLastScannedType('location');
      setLastScannedValue(pendingLocationForOccupancy.location_code);
      setWrongScanTypeWarning(null);
      
      setOccupancyDialogOpen(false);
      setPendingLocationForOccupancy(null);
      toast.success(`Location locked: ${pendingLocationForOccupancy.location_code}`);
    }
  };

  const handleScanDifferent = () => {
    setOccupancyDialogOpen(false);
    setPendingLocationForOccupancy(null);
    setOccupancy(null);
    toast('Scan a different location', { icon: 'ℹ️' });
  };

  const handleBoxScan = async (boxId: string) => {
    if (processingBoxRef.current.has(boxId)) {
      return;
    }

    processingBoxRef.current.add(boxId);

    try {
      let event: Event;

      if (mode === 'MOVE') {
        if (!pendingLocationCode) {
          toast.error('Please scan location first');
          return;
        }
        event = await createEvent({
          event_type: 'MOVE',
          box_id: boxId,
          location_code: pendingLocationCode,
          mode: 'MOVE',
        });
      } else if (mode === 'INBOUND') {
        event = await createEvent({
          event_type: 'IN',
          box_id: boxId,
          mode: 'INBOUND',
        });
      } else {
        event = await createEvent({
          event_type: 'OUT',
          box_id: boxId,
          mode: 'OUTBOUND',
        });
      }

      setLastEvent(event);
      setLastEventId(event.event_id);
      
      // Update last scanned info for ScanCoach
      setLastScannedType('box');
      setLastScannedValue(boxId);

      // Fetch box details for confirmation card
      try {
        const details = await getBox(boxId);
        setBoxDetails(details);
      } catch (error) {
        console.error('Failed to fetch box details:', error);
      }

      // Stats will auto-refresh via useStats hook

      if (event.is_duplicate) {
        toast('Event already processed', { icon: 'ℹ️' });
      } else {
        // Show appropriate message based on changed field
        if (event.changed === false) {
          // Box already at this location
          const locationName = pendingLocation?.location_code || 'this location';
          toast(`Already in ${locationName}. No changes made.`, { icon: 'ℹ️' });
        } else {
          // Successful move
          const locationName = pendingLocation?.location_code || 'location';
          if (mode === 'MOVE') {
            toast.success(`Moved to ${locationName}`);
          } else {
            toast.success(event.message || 'Event created successfully');
          }
        }
        // Stop camera after successful scan to prevent duplicate scans
        setCameraActive(false);
      }

      if (event.warning) {
        toast(event.warning, { icon: '⚠️', duration: 5000 });
      }

      // Note: Don't reset MOVE mode state here - keep it for the confirmation card
      // It will be reset when the user dismisses the confirmation card or starts a new scan
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        processingBoxRef.current.delete(boxId);
      }, 5000);
    }
  };

  const handleUndo = async () => {
    if (!lastEventId) {
      toast.error('No action to undo');
      return;
    }

    try {
      await undoEvent(lastEventId);
      toast.success('Action undone successfully');
      
      // Clear state
      setLastEvent(null);
      setLastEventId(null);
      setBoxDetails(null);
      setLastScannedType(null);
      setLastScannedValue(null);
      setWrongScanTypeWarning(null);

      // Stats will auto-refresh via useStats hook
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to undo event';
      toast.error(errorMessage);
    }
  };

  const clearPendingLocation = () => {
    setPendingLocation(null);
    setPendingLocationCode(null);
    setMoveStep(1);
    setLastScannedType(null);
    setLastScannedValue(null);
    setWrongScanTypeWarning(null);
    toast('Location cleared', { icon: 'ℹ️' });
  };

  const handleBackToActions = () => {
    setMode(null);
    setCameraActive(false);
    setPendingLocation(null);
    setPendingLocationCode(null);
    setMoveStep(1);
    setLastEvent(null);
    setLastEventId(null);
    setBoxDetails(null);
  };

  // Show action selection screen
  if (!mode) {
    // Create action cards with proper ordering and urgency
      const receiveCard = (
        <ActionCard
          key="receive"
          title="Receive"
          subtitle="Scan incoming boxes"
          description="When a delivery arrives, scan each box QR code to register it in the system. Boxes will be placed in RECEIVING area first."
          icon={Download}
          onClick={() => handleModeSelect('INBOUND')}
          iconColor="text-blue-600"
        />
      );

      const moveCard = (
        <ActionCard
          key="move"
          title="Move"
          subtitle="Put boxes on shelves"
          description="Move boxes from RECEIVING to their permanent shelf locations. Scan location QR first, then scan the box QR code."
          icon={Move}
          onClick={() => handleModeSelect('MOVE')}
          iconColor="text-green-600"
          isUrgent={toPutAway > 0}
        />
      );

      const outgoingCard = (
        <ActionCard
          key="outgoing"
          title="Outgoing"
          subtitle="Scan boxes to ship"
          description="When shipping boxes out, scan the box QR code to mark it as shipped and remove it from inventory."
          icon={Upload}
          onClick={() => handleModeSelect('OUTBOUND')}
          iconColor="text-red-600"
        />
      );

    // Reorder cards: Move first if urgent, otherwise standard order
    const actionCards = toPutAway > 0
      ? [moveCard, receiveCard, outgoingCard]
      : [receiveCard, moveCard, outgoingCard];

    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <PageHeader
            title="Operator Home"
            subtitle="Status board and action console for warehouse operations"
          />
          
          <WorkStatusBanner 
            onStartMove={() => handleModeSelect('MOVE')}
          />
          
          <WorkflowMetrics onWaitingClick={() => handleModeSelect('MOVE')} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            {actionCards}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="lg:col-span-2">
              <PutawayTaskList onPutAway={() => handleModeSelect('MOVE')} />
            </div>
            <div>
              <RecentActivityFeed />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show scanning interface
  const modeTitle = mode === 'INBOUND' ? 'Receive' : mode === 'OUTBOUND' ? 'Outgoing' : 'Move';
  const modeSubtitle = mode === 'INBOUND' 
    ? 'Scan box QR codes to register incoming deliveries'
    : mode === 'OUTBOUND'
    ? 'Scan box QR codes to ship boxes out'
    : 'Scan location first, then box QR codes to relocate';

  return (
    <PageTransition>
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader
          title={modeTitle}
          subtitle={modeSubtitle}
        >
          <div className="flex items-center gap-3">
            {lastEventId && (
              <motion.button
                onClick={handleUndo}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl',
                  'hover:bg-amber-600 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </motion.button>
            )}
          <motion.button
            onClick={handleBackToActions}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900',
                'transition-colors rounded-lg sm:rounded-xl hover:bg-slate-100 text-xs sm:text-sm font-semibold min-h-[44px]'
              )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
              <ArrowLeft className="w-4 h-4" />
              Back
          </motion.button>
        </div>
        </PageHeader>

        {/* Location Occupancy Dialog */}
        <LocationOccupancyDialog
          open={occupancyDialogOpen}
          onClose={() => {
            setOccupancyDialogOpen(false);
            setPendingLocationForOccupancy(null);
          }}
          onAssignAnyway={handleAssignAnyway}
          onScanDifferent={handleScanDifferent}
          occupancy={occupancy}
          loading={checkingOccupancy}
        />

        {/* Show confirmation card if we have a last event, regardless of camera state */}
        <AnimatePresence>
          {lastEvent && (
            <ScanConfirmationCard
              event={lastEvent || undefined}
              boxDetails={boxDetails || undefined}
              location={pendingLocation || undefined}
              onDismiss={() => {
                setLastEvent(null);
                setLastEventId(null);
                setBoxDetails(null);
                // Reset MOVE mode state when dismissing confirmation card
                if (mode === 'MOVE') {
                  setPendingLocation(null);
                  setPendingLocationCode(null);
                  setMoveStep(1);
                }
                // Clear scan state
                setLastScannedType(null);
                setLastScannedValue(null);
                setWrongScanTypeWarning(null);
              }}
            />
          )}
        </AnimatePresence>

        {!cameraActive && !lastEvent ? (
          <motion.div
            className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">
                {mode === 'MOVE' && moveStep === 1
                  ? 'Ready to scan location QR code'
                  : mode === 'MOVE' && moveStep === 2
                  ? 'Ready to scan box QR code'
                  : mode === 'INBOUND'
                  ? 'Ready to scan box QR code'
                  : 'Ready to scan box QR code'}
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                {mode === 'MOVE' && moveStep === 1
                  ? 'Find the location QR code on the shelf where you want to place the box'
                  : mode === 'MOVE' && moveStep === 2
                  ? 'Find the box QR code on the label of the box you want to move'
                  : mode === 'INBOUND'
                  ? 'Find the box QR code on the label of the box you received'
                  : 'Find the box QR code on the label of the box you want to ship'}
              </p>
            </div>

            {/* Visual Example */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-4">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    {mode === 'MOVE' && moveStep === 1 ? (
                      <MapPin className="w-12 h-12 text-slate-400" />
                    ) : (
                      <QrCode className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-2">
                    {mode === 'MOVE' && moveStep === 1 ? 'Location QR' : 'Box QR'}
                  </p>
                </div>
                {mode === 'MOVE' && moveStep === 2 && (
                  <>
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-2 mx-auto">
                        <Package className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-2">Box QR</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-center">
                <motion.button
                  onClick={handleStartCamera}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg transition-colors mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-8 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <QRScanner
                active={cameraActive}
                expectedPrefix={mode === 'MOVE' ? (moveStep === 1 ? 'LOC:' : 'BOX:') : 'BOX:'}
                onScanSuccess={(value, type) => {
                  // Clear wrong scan type warning on successful scan
                  setWrongScanTypeWarning(null);
                  setLastScannedType(type);
                  setLastScannedValue(value);
                  
                  if (mode === 'MOVE') {
                    if (moveStep === 1) {
                      handleLocationScan(value);
                    } else {
                      handleBoxScan(value);
                    }
                  } else {
                    handleBoxScan(value);
                  }
                }}
                onWrongType={(expected, received) => {
                  setWrongScanTypeWarning({ expected, received });
                  setLastScannedType(received);
                  // Don't clear lastScannedValue - we might want to show what was scanned
                }}
                onScanError={(error) => {
                  toast.error(error);
                }}
              />
              <motion.button
                onClick={handleStopCamera}
                className="absolute top-4 right-4 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 shadow-xl z-10 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <XCircle className="w-4 h-4" />
                Stop Camera
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
