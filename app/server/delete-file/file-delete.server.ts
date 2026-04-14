import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { deleteObjectFromR2 } from '~/server/r2/r2.server';

/**
 * Deletes a file from the local storage
 * @param filePath - Relative file path (e.g., "/uploads/filename.pdf")
 * @returns Promise that resolves to true if file was deleted, false if file didn't exist
 */
export async function deleteFileLocally(filePath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Construct the full file path
    const fullPath = join(process.cwd(), 'public', filePath);

    // Check if file exists before attempting to delete
    if (!existsSync(fullPath)) {
      return { success: false, error: 'File does not exist' };
    }

    // Delete the file
    await unlink(fullPath);

    return { success: true };
  } catch (error) {
    // Return error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Safely deletes a file from storage, ignoring errors if file doesn't exist
 * Useful when you want to delete a file but don't care if it's already gone
 * @param filePath - Relative file path (e.g., "/uploads/filename.pdf")
 * @returns Promise that resolves to true if file was deleted or didn't exist, false on other errors
 */
export async function deleteFileSafely(filePath: string): Promise<boolean> {
  try {
    if (!filePath) {
      return true;
    }

    // Legacy local storage files (e.g. "/uploads/filename.pdf")
    if (filePath.startsWith('/uploads/')) {
      const fullPath = join(process.cwd(), 'public', filePath);

      // Only attempt deletion if file exists
      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }

      return true;
    }

    // R2-backed files use the raw key stored in file_path
    const deleted = await deleteObjectFromR2(filePath);
    return deleted;
  } catch (error) {
    // Log error but don't throw - file might already be deleted
    console.error('Error deleting file:', error);
    return false;
  }
}

