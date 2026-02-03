import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID based on timestamp
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return "Just now";
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Sanitize output text to prevent XSS
 */
export function sanitizeOutput(text: string): string {
  if (text.length > 10000) {
    text = text.substring(0, 10000);
  }
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Convert audio blob to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Interface for dictation history items
 */
export interface DictationItem {
  id: string;
  originalText: string;
  refinedText: string;
  timestamp: number;
  duration: number;
  mode: "developer" | "concise" | "professional" | "raw";
  processingMode: "cloud" | "local";
}

/**
 * Interface for application settings
 */
export interface Settings {
  hotkey: string;
  refinementMode: "developer" | "concise" | "professional" | "raw";
  processingMode: "cloud" | "local";
  autoCopy: boolean;
  soundEnabled: boolean;
}

/**
 * Default settings
 */
export const defaultSettings: Settings = {
  hotkey: "alt+v",
  refinementMode: "developer",
  processingMode: "cloud",
  autoCopy: true,
  soundEnabled: true,
};

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("localflow-settings", JSON.stringify(settings));
  }
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): Settings {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("localflow-settings");
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
  }
  return defaultSettings;
}

/**
 * Save dictation history to localStorage
 */
export function saveHistory(history: DictationItem[]): void {
  if (typeof window !== "undefined") {
    // Keep only the last 100 items
    const trimmed = history.slice(-100);
    localStorage.setItem("localflow-history", JSON.stringify(trimmed));
  }
}

/**
 * Load dictation history from localStorage
 */
export function loadHistory(): DictationItem[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("localflow-history");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
  }
  return [];
}
