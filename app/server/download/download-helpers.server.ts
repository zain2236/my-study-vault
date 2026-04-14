import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Get MIME type based on file extension
 * @param filePath - The file path
 * @returns MIME type string
 */
export function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Sanitize file title for use in filename
 * @param title - The resource title
 * @returns Sanitized title safe for use in filenames
 */
export function sanitizeFileName(title: string): string {
  return title.replace(/[^a-zA-Z0-9.-]/g, '-');
}

/**
 * Get full file path from relative path
 * @param relativePath - Relative file path (e.g., "/uploads/file.pdf")
 * @returns Full file path
 */
export function getFullFilePath(relativePath: string): string {
  return join(process.cwd(), 'public', relativePath);
}

/**
 * Check if file exists in storage
 * @param relativePath - Relative file path (e.g., "/uploads/file.pdf")
 * @returns True if file exists, false otherwise
 */
export function fileExists(relativePath: string): boolean {
  const fullPath = getFullFilePath(relativePath);
  return existsSync(fullPath);
}

/**
 * Generate download filename from resource title and file path
 * @param title - Resource title
 * @param filePath - File path to extract extension
 * @returns Generated filename
 */
export function generateDownloadFileName(title: string, filePath: string): string {
  const fileExtension = filePath.substring(filePath.lastIndexOf('.'));
  const sanitizedTitle = sanitizeFileName(title);
  return `${sanitizedTitle}${fileExtension}`;
}

