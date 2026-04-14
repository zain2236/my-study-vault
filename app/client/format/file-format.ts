/**
 * Formats file size from bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets file type from file path
 * @param filePath - Path to the file
 * @returns Uppercase file extension (e.g., "PDF")
 */
export function getFileType(filePath: string): string {
  return filePath.split('.').pop()?.toUpperCase() || 'PDF';
}

