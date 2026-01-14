/** API client functions */
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Event, Box, Product, InventoryItem, BoxDetails, Location, Mode, EventType, SourceType } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const createProduct = async (product: { brand: string; name: string; size?: string }): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

// Boxes
export const createBox = async (data: { product_id: string; lot_code?: string }): Promise<Box> => {
  const response = await api.post('/boxes', data);
  return response.data;
};

export const getBox = async (box_id: string): Promise<BoxDetails> => {
  const response = await api.get(`/boxes/${box_id}`);
  return response.data;
};

// Events
export const createEvent = async (data: {
  event_type: EventType;
  box_id: string;
  location_code?: string;
  mode: Mode;
  source_type?: SourceType;
}): Promise<Event> => {
  const client_event_id = uuidv4();
  const response = await api.post('/events', {
    ...data,
    client_event_id,
  });
  return response.data;
};

// Inventory
export const getInventory = async (params?: {
  status?: string;
  location_id?: string;
  search?: string;
  event_type_today?: string;  // "IN", "MOVE", or "OUT"
  date_from?: string;  // ISO date string (YYYY-MM-DD)
  date_to?: string;  // ISO date string (YYYY-MM-DD)
}): Promise<InventoryItem[]> => {
  const response = await api.get('/inventory', { params });
  return response.data;
};

// Locations
export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get('/locations');
  return response.data;
};

export const createLocation = async (data: {
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
}): Promise<Location> => {
  const response = await api.post('/locations', data);
  return response.data;
};

export interface LocationOccupancy {
  location_id: string;
  location_code: string;
  active_box_count: number;
  boxes: Array<{
    box_id: string;
    product_name: string;
    size?: string;
    lot_code?: string;
    last_moved_at?: string;
  }>;
}

export const getLocationOccupancy = async (location_id: string): Promise<LocationOccupancy> => {
  const response = await api.get(`/locations/${location_id}/occupancy`);
  return response.data;
};

// Events
export const getEvents = async (params?: {
  limit?: number;
  show_exceptions_only?: boolean;
}): Promise<any[]> => {
  const response = await api.get('/events', { params });
  return response.data;
};

// Exceptions (legacy - kept for backward compatibility)
export const getExceptions = async (params?: {
  exception_type?: string;
  limit?: number;
}): Promise<any[]> => {
  const response = await api.get('/exceptions', { params });
  return response.data;
};

// Stats
export interface WaitingPutawayPreviewItem {
  box_id: string;
  product: Product;
  lot_code?: string;
  last_event_time?: string;
}

export interface RecentEvent {
  event_id: string;
  timestamp: string;
  event_type: EventType;
  box_id: string;
  product: Product;
  lot_code?: string;
  location_code?: string;
}

export interface StatsToday {
  received_today: number;
  to_put_away: number;
  moved_today: number;
  shipped_today: number;
  exceptions_today: number;
  server_time: string;
  waiting_putaway_preview: WaitingPutawayPreviewItem[];
  recent_events: RecentEvent[];
}

export const getStatsToday = async (): Promise<StatsToday> => {
  const response = await api.get('/stats/today');
  return response.data;
};

// Legacy alias for backward compatibility
export const getStats = getStatsToday;

// Events - Undo
export interface UndoEventResponse {
  success: boolean;
  message: string;
  box_id: string;
  product: Product;
  lot_code?: string;
  status: string;
  current_location?: Location;
}

export const undoEvent = async (event_id: string): Promise<UndoEventResponse> => {
  const response = await api.post(`/events/${event_id}/undo`);
  return response.data;
};
