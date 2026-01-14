'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ value, size = 256, className }: QRCodeDisplayProps) {
  return (
    <div className={className}>
      <QRCodeSVG value={value} size={size} level="H" />
    </div>
  );
}
