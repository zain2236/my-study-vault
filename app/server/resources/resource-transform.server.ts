import { getRelativeTime } from '~/client/handle-time/relative-time';
import { formatFileSize, getFileType } from '~/client/format/file-format';

export interface TransformedResource {
  id: number;
  title: string;
  subject: string;
  semester: number;
  type: string;
  fileType: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  downloads: number;
}

/**
 * Transforms database resource to UI-friendly format
 */
export function transformResource(resource: {
  Id: number;
  title: string;
  subject: string;
  semester: number;
  resource_type: string;
  file_path: string;
  file_size: bigint | number;
  downloads: number;
  created_at: Date | string;
  user: { user_name: string };
}): TransformedResource {
  return {
    id: resource.Id,
    title: resource.title,
    subject: resource.subject,
    semester: resource.semester,
    type: resource.resource_type,
    fileType: getFileType(resource.file_path),
    size: formatFileSize(Number(resource.file_size)),
    uploadedBy: resource.user.user_name,
    uploadedDate: getRelativeTime(resource.created_at),
    downloads: resource.downloads
  };
}

