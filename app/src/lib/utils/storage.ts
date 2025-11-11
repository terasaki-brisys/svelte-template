// localStorage utility for participant authentication and data persistence

export interface ParticipantStorage {
  shareId: string;
  participantId: string;
  participantToken: string;
  deviceHash: string;
  nickname: string;
  timestamp: number;
}

export interface CreatedEventStorage {
  eventId: string;
  shareId: string;
  adminKey: string;
  title: string;
  adminUrl: string;
  shareUrl: string;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = 'scheduler_participant_';
const DEVICE_HASH_KEY = 'scheduler_device_hash';
const CREATED_EVENTS_KEY = 'scheduler_created_events';

/**
 * Generate a device hash for anonymous identification
 * This is stored in localStorage and persists across sessions
 */
export function getOrCreateDeviceHash(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceHash = localStorage.getItem(DEVICE_HASH_KEY);
  
  if (!deviceHash) {
    // Generate a random device hash (128 bits = 32 hex chars)
    deviceHash = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    localStorage.setItem(DEVICE_HASH_KEY, deviceHash);
  }
  
  return deviceHash;
}

/**
 * Save participant data to localStorage
 */
export function saveParticipantData(data: ParticipantStorage): void {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}${data.shareId}`;
  const storageData = {
    ...data,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save participant data:', error);
  }
}

/**
 * Load participant data from localStorage
 */
export function loadParticipantData(shareId: string): ParticipantStorage | null {
  if (typeof window === 'undefined') return null;
  
  const key = `${STORAGE_KEY_PREFIX}${shareId}`;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as ParticipantStorage;
    
    // Check if data is not too old (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDaysInMs) {
      removeParticipantData(shareId);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load participant data:', error);
    return null;
  }
}

/**
 * Remove participant data from localStorage
 */
export function removeParticipantData(shareId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `${STORAGE_KEY_PREFIX}${shareId}`;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove participant data:', error);
  }
}

/**
 * Clear all participant data (for debugging or privacy)
 */
export function clearAllParticipantData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear participant data:', error);
  }
}

/**
 * Get all stored participant data (for debugging)
 */
export function getAllParticipantData(): ParticipantStorage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const keys = Object.keys(localStorage);
    const data: ParticipantStorage[] = [];
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            data.push(JSON.parse(stored));
          } catch {
            // Skip invalid data
          }
        }
      }
    });
    
    return data;
  } catch (error) {
    console.error('Failed to get all participant data:', error);
    return [];
  }
}

/**
 * Save created event to localStorage
 */
export function saveCreatedEvent(event: Omit<CreatedEventStorage, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const events = getCreatedEvents();
    const newEvent: CreatedEventStorage = {
      ...event,
      createdAt: Date.now()
    };
    
    // Add to the beginning of the array (most recent first)
    events.unshift(newEvent);
    
    // Keep only the last 50 events
    const limitedEvents = events.slice(0, 50);
    
    localStorage.setItem(CREATED_EVENTS_KEY, JSON.stringify(limitedEvents));
  } catch (error) {
    console.error('Failed to save created event:', error);
  }
}

/**
 * Get all created events from localStorage
 */
export function getCreatedEvents(): CreatedEventStorage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CREATED_EVENTS_KEY);
    if (!stored) return [];
    
    const events = JSON.parse(stored) as CreatedEventStorage[];
    
    // Filter out events older than 90 days
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    const validEvents = events.filter(event => 
      Date.now() - event.createdAt < ninetyDaysInMs
    );
    
    // Update storage if we filtered out any events
    if (validEvents.length !== events.length) {
      localStorage.setItem(CREATED_EVENTS_KEY, JSON.stringify(validEvents));
    }
    
    return validEvents;
  } catch (error) {
    console.error('Failed to get created events:', error);
    return [];
  }
}

/**
 * Remove a created event from localStorage
 */
export function removeCreatedEvent(eventId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const events = getCreatedEvents();
    const filteredEvents = events.filter(event => event.eventId !== eventId);
    localStorage.setItem(CREATED_EVENTS_KEY, JSON.stringify(filteredEvents));
  } catch (error) {
    console.error('Failed to remove created event:', error);
  }
}

/**
 * Clear all created events (for privacy)
 */
export function clearAllCreatedEvents(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CREATED_EVENTS_KEY);
  } catch (error) {
    console.error('Failed to clear created events:', error);
  }
}
