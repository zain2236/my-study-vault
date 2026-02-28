import type { Route } from './+types/download.$id';
import { redirect } from 'react-router';
import { readFile } from 'fs/promises';
import { 
  getResourceForDownload, 
  incrementResourceDownload 
} from '~/utils/prisma/resource-prisma.server';
import {
  getMimeType,
  getFullFilePath,
  fileExists,
  generateDownloadFileName
} from '~/utils/download/download-helpers.server';
import { objectExistsInR2, getObjectBufferFromR2 } from '~/utils/r2/r2.server';

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const resourceId = Number((params as { id?: string })?.id);
    
    // Validate resource ID
    if (!resourceId || isNaN(resourceId)) {
      return redirect('/resources?error=invalid-resource');
    }

    // Get resource from database WITHOUT incrementing download count yet
    const resource = await getResourceForDownload(resourceId);

    if (!resource) {
      // Resource doesn't exist in database - redirect to resources page
      return redirect('/resources?error=resource-not-found');
    }

    const isLocalFile = resource.file_path.startsWith('/uploads/');

    // Check if file exists in storage BEFORE incrementing download count
    if (isLocalFile) {
      if (!fileExists(resource.file_path)) {
        // File doesn't exist in storage - redirect to resources page with error
        // Don't increment download count since file doesn't exist
        return redirect('/resources?error=file-not-found');
      }
    } else {
      const existsInR2 = await objectExistsInR2(resource.file_path);
      if (!existsInR2) {
        return redirect('/resources?error=file-not-found');
      }
    }

    // File exists, now increment download count
    const updatedResource = await incrementResourceDownload(resourceId);

    // Read and return file
    try {
      let fileBuffer: Buffer;

      if (isLocalFile) {
        const fullPath = getFullFilePath(updatedResource.file_path);
        fileBuffer = await readFile(fullPath);
      } else {
        const r2Buffer = await getObjectBufferFromR2(updatedResource.file_path);
        if (!r2Buffer) {
          return redirect('/resources?error=file-read-error');
        }
        fileBuffer = r2Buffer;
      }

      const fileName = generateDownloadFileName(updatedResource.title, updatedResource.file_path);

      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': getMimeType(updatedResource.file_path),
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (readError) {
      // File read error - redirect to resources page
      console.error('Error reading file:', readError);
      return redirect('/resources?error=file-read-error');
    }
  } catch (error) {
    // Database or other errors - redirect to resources page
    console.error('Download error:', error);
    return redirect('/resources?error=download-failed');
  }
}
