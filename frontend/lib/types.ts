/** TypeScript types for the application */

export type Mode = 'INBOUND' | 'OUTBOUND' | 'MOVE';

export type EventType = 'IN' | 'OUT' | 'MOVE';

export type SourceType = 'PHONE' | 'INBOUND_STATION' | 'OUTBOUND_STATION' | 'API';

export type ExceptionType = 'OUT_WITHOUT_IN' | 'MOVE_WHEN_OUT' | 'DUPLICATE_SCAN';

export interface Product {
  product_id: string;
  brand: string;
  name: string;
  size?: string;
}

export interface Box {
  box_id: string;
  qr_value: string;
  product: Product;
  lot_code?: string;
}

export interface Location {
  location_id: string;
  location_code: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  is_system_location: boolean;
}

export interface Event {
  event_id: string;
  success: boolean;
  message: string;
  warning?: string;
  exception_type?: ExceptionType;
  is_duplicate: boolean;
  changed?: boolean; // True if location/status changed, False if already at location
  box_id: string;
  product: Product;
  lot_code?: string;
}

export interface InventoryItem {
  box_id: string;
  status: string;
  current_location?: Location;
  last_event_time?: string;
  product: Product;
  lot_code?: string;
}

export interface BoxDetails {
  box_id: string;
  product: Product;
  lot_code?: string;
  status: string;
  current_location?: Location;
  events: any[];
}
