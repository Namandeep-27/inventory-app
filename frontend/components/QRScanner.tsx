'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { playSuccessBeep, playErrorBeep, vibrateSuccess, vibrateError } from '@/lib/feedback';

interface QRScannerProps {
  expectedPrefix?: 'LOC:' | 'BOX:' | null;
  onScanSuccess: (value: string, type: 'box' | 'location') => void;
  onScanError: (error: string) => void;
  onWrongType?: (expected: 'box' | 'location', received: 'box' | 'location') => void;
  className?: string;
  active?: boolean;
}

export default function QRScanner({ expectedPrefix, onScanSuccess, onScanError, onWrongType, className, active = true }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const lastScannedRef = useRef<{ value: string; timestamp: number } | null>(null);
  const isProcessingRef = useRef(false);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);
  const onWrongTypeRef = useRef(onWrongType);

  // Keep refs in sync with props
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
    onWrongTypeRef.current = onWrongType;
  }, [onScanSuccess, onScanError, onWrongType]);

  useEffect(() => {
    if (!active) {
      // Stop scanner if active prop is false
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            setIsScanning(false);
          })
          .catch((err) => {
            console.error('Failed to stop scanner:', err);
          })
          .finally(() => {
            scannerRef.current = null;
          });
      }
      return;
    }

    let mounted = true;

    const startScanning = async () => {
      if (!mounted || !active) return;
      
      // Wait for DOM element to be available
      const elementId = 'qr-reader';
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('QR reader element not found');
        return;
      }

      try {
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 5,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText, decodedResult) => {
            if (!mounted || !active) return;
            
            // Prevent multiple simultaneous processing
            if (isProcessingRef.current) {
              return;
            }

            // Cooldown check using ref (to avoid stale closure)
            const now = Date.now();
            const lastScanned = lastScannedRef.current;
            
            // Ignore duplicate scans within 5 seconds
            if (lastScanned && lastScanned.value === decodedText && (now - lastScanned.timestamp) < 5000) {
              return;
            }

            // Mark as processing to prevent duplicates
            isProcessingRef.current = true;
            lastScannedRef.current = { value: decodedText, timestamp: now };

            // Validate prefix
            if (expectedPrefix != null) {
              if (!decodedText.startsWith(expectedPrefix)) {
                playErrorBeep();
                vibrateError();
                
                // Determine what was scanned and what was expected
                const scannedType = decodedText.startsWith('BOX:') ? 'box' : decodedText.startsWith('LOC:') ? 'location' : null;
                const expectedType = expectedPrefix === 'BOX:' ? 'box' : 'location';
                
                if (scannedType && onWrongTypeRef.current) {
                  // Call onWrongType callback
                  onWrongTypeRef.current(expectedType, scannedType);
                } else {
                  onScanErrorRef.current(`Invalid QR type. Expected ${expectedPrefix} prefix.`);
                }
                
                setTimeout(() => {
                  isProcessingRef.current = false;
                }, 1000);
                return;
              }
              
              // Strip prefix
              const value = decodedText.substring(expectedPrefix.length);
              const scanType = expectedPrefix === 'BOX:' ? 'box' : 'location';
              playSuccessBeep();
              vibrateSuccess();
              onScanSuccessRef.current(value, scanType);
              
              setTimeout(() => {
                isProcessingRef.current = false;
              }, 4000);
            } else {
              // Accept both prefixes
              if (decodedText.startsWith('LOC:')) {
                const value = decodedText.substring(4);
                playSuccessBeep();
                vibrateSuccess();
                onScanSuccessRef.current(value, 'location');
                setTimeout(() => {
                  isProcessingRef.current = false;
                }, 4000);
              } else if (decodedText.startsWith('BOX:')) {
                const value = decodedText.substring(4);
                playSuccessBeep();
                vibrateSuccess();
                onScanSuccessRef.current(value, 'box');
                setTimeout(() => {
                  isProcessingRef.current = false;
                }, 4000);
              } else {
                playErrorBeep();
                vibrateError();
                onScanErrorRef.current('Invalid QR type. Expected LOC: or BOX: prefix.');
                setTimeout(() => {
                  isProcessingRef.current = false;
                }, 1000);
              }
            }
          },
          (errorMessage) => {
            // Ignore scanning errors (just keep scanning)
          }
        );
        
        if (mounted && active) {
          setIsScanning(true);
        }
      } catch (err) {
        if (mounted && active) {
          console.error('Failed to start scanner:', err);
          onScanErrorRef.current('Failed to start camera. Please check permissions.');
        }
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      startScanning();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            setIsScanning(false);
            isProcessingRef.current = false;
          })
          .catch((err) => {
            console.error('Failed to stop scanner:', err);
          })
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [expectedPrefix, active]);

  return (
    <div className={className}>
      <div id="qr-reader" className="w-full max-w-md mx-auto" />
    </div>
  );
}
