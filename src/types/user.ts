/**
 * Tipos para usuarios
 */

export type AuthProvider = 'google' | 'email' | 'apple';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: AuthProvider;
  googleDriveConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  currency: string;
  language: string;
  notificationsEnabled: boolean;
  autoBackupDrive: boolean;
}

export interface GoogleDriveConnection {
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  userEmail?: string;
}
