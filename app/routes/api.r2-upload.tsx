import type { Route } from './+types/api.r2-upload';

import { getUserId } from '~/server/cookie-session/session.server';
import { createResource } from '~/server/prisma/dashboard-prisma.server';
import { createPresignedUploadUrl } from '~/server/r2/r2.server';


const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

function isAllowedFileType(name: string, type: string) {
  if (ALLOWED_TYPES.includes(type)) return true;
  const lower = name.toLowerCase();
  return (
    lower.endsWith('.pdf') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png')
  );
}

function validateFileMeta(size: number, type: string, name: string) {
  if (Number.isNaN(size) || size <= 0) {
    return 'Invalid file size.';
  }
  if (size > MAX_SIZE_BYTES) {
    return 'File too large. Maximum size is 20MB.';
  }
  if (!isAllowedFileType(name, type)) {
    return 'Invalid file type. Only PDF, DOCX, JPG, PNG allowed.';
  }
  return null;
}

// Sanitize file name
function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '-');
}


// Main action function
export async function action({ request }: Route.ActionArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    return Response.json(
      { ok: false, error: 'Unauthorized', phase: 'auth' },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  // 1) Get pre-signed upload URL
  if (intent === 'get-upload-url') {
    const fileName = formData.get('fileName') as string | null;
    const fileType = formData.get('fileType') as string | null;
    const fileSizeRaw = formData.get('fileSize') as string | null;

    if (!fileName || !fileType || !fileSizeRaw) {
      return Response.json(
        { ok: false, error: 'Missing file information.', phase: 'prepare' },
        { status: 400 }
      );
    }

    // Validate fileSIze on server 
    const fileSize = Number(fileSizeRaw);
    const validationError = validateFileMeta(fileSize, fileType, fileName);
    if (validationError) {
      return Response.json(
        { ok: false, error: validationError, phase: 'prepare' },
        { status: 400 }
      );
    }

    // Create a new folder named user-${userId} and a key for the uploaded file
    // (Each user have it's own folder with there private key ) 
    const safeName = sanitizeFileName(fileName);
    const key = `user-${userId}/${Date.now()}-${safeName}`;

    try {
      const uploadUrl = await createPresignedUploadUrl({
        key,
        contentType: fileType,
      });

      // Return the pre-signed URL and file key to the client
      return Response.json(
        {
          ok: true,
          phase: 'prepare',
          uploadUrl,
          fileKey: key,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[R2] Failed to create presigned upload URL', error);
      return Response.json(
        {
          ok: false,
          phase: 'prepare',
          error: 'Service is down. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  // 2) Confirm upload and create resource
  if (intent === 'confirm-upload') {
    const title = formData.get('title');
    const semester = formData.get('semester');
    const subject = formData.get('subject');
    const resource_type = formData.get('resource_type');
    const fileKey = formData.get('fileKey') as string | null;
    const fileSizeRaw = formData.get('fileSize') as string | null;

    if (!title || !semester || !subject || !resource_type || !fileKey || !fileSizeRaw) {
      return Response.json(
        { ok: false, error: 'All fields are required.', phase: 'confirm' },
        { status: 400 }
      );
    }

    const fileSize = Number(fileSizeRaw);
    if (Number.isNaN(fileSize) || fileSize <= 0 || fileSize > MAX_SIZE_BYTES) {
      return Response.json(
        { ok: false, error: 'Invalid file size.', phase: 'confirm' },
        { status: 400 }
      );
    }

    // Create resource in database
    try {
      const resource = await createResource({
        title: title as string,
        semester: Number(semester),
        subject: subject as string,
        resource_type: resource_type as string,
        file_path: fileKey,
        file_size: BigInt(fileSize),
        user_id: userId as number,
      });

      // Return the resource ID to the client 
      return Response.json(
        {
          ok: true,
          phase: 'confirm',
          resourceId: resource.Id,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[R2] Failed to create resource after upload', error);
      return Response.json(
        {
          ok: false,
          phase: 'confirm',
          error: 'Service is down. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { ok: false, error: 'Invalid request.', phase: 'unknown' },
    { status: 400 }
  );
}

