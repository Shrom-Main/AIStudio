import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { PipelineSnapshot } from '../types/pipeline';

// Initialize Firebase App safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Google Drive scope for user-created file management
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token management (per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveDatasetMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Initialize Google Auth state listener.
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Prompt user for Google Workspace Sign-in with Drive scope
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    throw new Error('Sign-in already in progress');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get cached access token in memory
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Sign out of Google session
 */
export const signOutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Save dataset to Google Drive using Drive v3 Multipart Upload
 */
export const saveDatasetToDrive = async (
  filename: string,
  content: string,
  mimeType: 'application/json' | 'text/csv' = 'application/json'
): Promise<DriveDatasetMetadata> => {
  if (!cachedAccessToken) {
    throw new Error('Google Drive access token not available. Please sign in first.');
  }

  const metadata = {
    name: filename,
    mimeType: mimeType,
    description: 'Industrial Consumables Distribution Engine - POC-001 Sensitivity & Analytics Dataset'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    mimeType: result.mimeType,
    modifiedTime: new Date().toISOString()
  };
};

/**
 * List files saved by this application in Google Drive
 */
export const listDriveDatasets = async (): Promise<DriveDatasetMetadata[]> => {
  if (!cachedAccessToken) return [];

  try {
    const query = encodeURIComponent("trashed = false and (mimeType = 'application/json' or mimeType = 'text/csv')");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc&pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`
        }
      }
    );

    if (!response.ok) {
      console.warn('Failed to list drive files:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing Drive datasets:', err);
    return [];
  }
};

/**
 * Fetch file content from Google Drive
 */
export const loadDriveDataset = async (fileId: string): Promise<string> => {
  if (!cachedAccessToken) {
    throw new Error('Not authenticated with Google Drive');
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load file from Drive: ${response.statusText}`);
  }

  return await response.text();
};

/**
 * Check if Google Drive access token is actively held in memory
 */
export const isAuthenticatedWithDrive = (): boolean => {
  return !!cachedAccessToken;
};

/**
 * Reusable snapshot archiver: Save an immutable PipelineSnapshot directly to Google Drive
 */
export const savePipelineSnapshotToDrive = async (
  snapshot: PipelineSnapshot
): Promise<DriveDatasetMetadata> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `pipeline_snapshot_${snapshot.snapshotId}_${timestamp}.json`;
  const content = JSON.stringify(snapshot, null, 2);
  return saveDatasetToDrive(filename, content, 'application/json');
};
