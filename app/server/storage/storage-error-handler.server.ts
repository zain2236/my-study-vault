/**
 * Storage error handling utilities
 * Provides functions to detect and handle storage-related errors
 */

export interface StorageErrorInfo {
  isStorageError: boolean;
  isPermissionError: boolean;
  isSpaceError: boolean;
  isPathError: boolean;
  message: string;
}

/**
 * Analyzes an error and determines if it's a storage-related error
 * @param error - The error to analyze
 * @returns StorageErrorInfo with error classification and user-friendly message
 */
export function analyzeStorageError(error: unknown): StorageErrorInfo {
  const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
  
  const isPermissionError = errorMessage.includes('EACCES') || 
                            errorMessage.includes('permission') ||
                            errorMessage.includes('Permission denied');
  
  const isSpaceError = errorMessage.includes('ENOSPC') || 
                      errorMessage.includes('space') ||
                      errorMessage.includes('Storage full');
  
  const isPathError = errorMessage.includes('ENOENT') || 
                     errorMessage.includes('Storage path') ||
                     errorMessage.includes('not found');
  
  const isStorageError = isPermissionError || 
                        isSpaceError || 
                        isPathError ||
                        errorMessage.includes('EISDIR') ||
                        errorMessage.includes('storage') ||
                        errorMessage.includes('Storage error');

  let message = 'Failed to process storage operation. Please try again.';
  
  if (isPermissionError) {
    message = 'Permission denied: Cannot access storage. Please check storage permissions.';
  } else if (isSpaceError) {
    message = 'Storage full: No space left on device. Please free up space and try again.';
  } else if (isPathError) {
    message = 'Storage path not found. Please check storage configuration.';
  } else if (isStorageError) {
    message = 'Storage unavailable. Please check storage availability and try again.';
  }

  return {
    isStorageError,
    isPermissionError,
    isSpaceError,
    isPathError,
    message
  };
}

/**
 * Gets a user-friendly error message for storage errors
 * @param error - The error to analyze
 * @returns User-friendly error message
 */
export function getStorageErrorMessage(error: unknown): string {
  return analyzeStorageError(error).message;
}

/**
 * Checks if an error is a storage-related error
 * @param error - The error to check
 * @returns True if it's a storage error
 */
export function isStorageError(error: unknown): boolean {
  return analyzeStorageError(error).isStorageError;
}

