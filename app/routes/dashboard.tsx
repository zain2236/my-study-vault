import type { Route } from './+types/dashboard';
import { redirect, Form, useLoaderData, useFetcher, useSearchParams, useNavigate, useNavigation, Await } from 'react-router';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Upload, X, Plus, Filter, Loader2 } from 'lucide-react';

import { ResourceCard } from '~/components/dashboard-components/ResourceCard';
import { getUserId } from '~/utils/cookie-session/session.server';
import { deleteFileSafely } from '~/utils/delete-file/file-delete.server';
import {
  getUserResourceById,
  updateResourcePublishStatus,

  deleteResource,
  getUserSemesterCounts
} from '~/utils/prisma/dashboard-prisma.server';
import { getPaginatedResources } from '~/utils/resources/resource-pagination.server';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to Your personal Dashboard!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect('/login');

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const searchQuery = url.searchParams.get('search') || undefined;
  const semester = url.searchParams.get('semester') || undefined;
  const resourceType = url.searchParams.get('type') || undefined;

  const resourcesPromise = (async () => {
    try {
      const [paginationResult, semesterCounts] = await Promise.all([
        getPaginatedResources({
          cursor,
          searchQuery,
          userId,
          semester: semester ? parseInt(semester, 10) : undefined,
          resourceType: resourceType && resourceType !== 'all' ? resourceType : undefined
        }),
        getUserSemesterCounts(userId)
      ]);

      return {
        resources: paginationResult.items || [],
        nextCursor: paginationResult.nextCursor,
        hasMore: paginationResult.hasMore,
        semesterCounts: semesterCounts || {},
        error: null as string | null
      };
    } catch (error) {
      return {
        resources: [],
        nextCursor: null,
        hasMore: false,
        semesterCounts: {},
        error: 'Service is down. Please try again.'
      };
    }
  })();

  return ({
    resourcesData: resourcesPromise
  });
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await getUserId(request);
    if (!userId) return redirect('/login');

    const data = await request.formData();
    const intent = data.get('intent');

    // Handle load more
    if (intent === 'load-more') {
      const cursor = data.get('cursor') as string | null;
      const searchQuery = data.get('search') as string | null;
      const semester = data.get('semester') as string | null;
      const resourceType = data.get('type') as string | null;

      try {
        // Get pagination result
        const result = await getPaginatedResources({
          cursor: cursor || undefined,
          searchQuery: searchQuery || undefined,
          userId,
          semester: semester ? parseInt(semester, 10) : undefined,
          resourceType: resourceType && resourceType !== 'all' ? resourceType : undefined
        });

        return {
          resources: result.items || [],
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          success: true
        };
      } catch (error) {
        return {
          success: false,
          error: 'Service is down. Please try again.'
        };
      }
    }

    // Handle publish/unpublish
    if (intent === 'publish' || intent === 'unpublish') {
      const resourceId = data.get('resourceId')
      if (!resourceId) return { error: 'Resource ID is required' }

      const resource = await getUserResourceById(Number(resourceId), userId)
      if (!resource) return { error: 'Resource not found' }

      try {
        await updateResourcePublishStatus(Number(resourceId), intent === 'publish')
        return { success: true }
      } catch (dbError) {
        return {
          error: 'Service is down. Please try again.'
        };
      }
    }

    // Handle download
    if (intent === 'download') {
      const resourceId = data.get('resourceId');
      if (!resourceId) return { error: 'Resource ID is required' };

      try {
        // Verify user owns the resource
        const resource = await getUserResourceById(Number(resourceId), userId);
        if (!resource) {
          return { error: 'Resource not found or you do not have permission to download it.' };
        }

        const filePath = resource.file_path;

        // Check if file exists in storage (local or R2)
        let exists = false;
        if (filePath.startsWith('/uploads/')) {
          const { fileExists } = await import('~/utils/download/download-helpers.server');
          exists = fileExists(filePath);
        } else {
          const { objectExistsInR2 } = await import('~/utils/r2/r2.server');
          exists = await objectExistsInR2(filePath);
        }

        if (!exists) {
          return { error: 'File not found in storage. The file may have been deleted.' };
        }

        // File exists; return download URL for client to handle.
        // The actual download route (/download/:id) is responsible for incrementing download count.
        return {
          success: true,
          downloadUrl: `/download/${resourceId}`
        };
      } catch (error) {
        return { error: 'Service is down. Please try again.' };
      }
    }

    // Handle delete
    if (intent === 'delete') {
      const resourceId = data.get('resourceId');
      if (!resourceId) return { error: 'Resource ID is required' };

      const resource = await getUserResourceById(Number(resourceId), userId);
      if (!resource) return { error: 'Resource not found' };

      // Try to delete file from storage (non-blocking)
      await deleteFileSafely(resource.file_path);

      // Delete from database (always attempt, even if file deletion failed)
      try {
        await deleteResource(Number(resourceId));
        return { success: true };
      } catch (dbError) {
        return {
          error: 'Service is down. Please try again.'
        };
      }
    }

    // No other intents handled here
    return { error: 'Invalid action.' };
  } catch (error) {
    return {
      error: 'Service is down. Please try again.'
    }
  }
}

type DashboardData = {
  resources: any[];
  nextCursor: string | null;
  hasMore: boolean;
  semesterCounts: Record<number, number>;
  error: string | null;
};

function DashboardContent({ data }: { data: DashboardData }) {
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isRouteLoading = navigation.state === 'loading';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropJustHappenedRef = useRef(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [allResources, setAllResources] = useState(data.resources);
  const [nextCursor, setNextCursor] = useState(data.nextCursor);
  const [hasMore, setHasMore] = useState(data.hasMore);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'prepare' | 'upload' | 'confirm'>('idle');

  const resourceType = searchParams.get('type') || null;

  // Update resources when loader data changes
  useEffect(() => {
    setAllResources(data.resources);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
  }, [data.resources, data.nextCursor, data.hasMore]);

  // Update resources when fetcher loads more
  useEffect(() => {
    const data = fetcher.data;
    if (data?.success && data.resources && Array.isArray(data.resources)) {
      setAllResources(prev => [...prev, ...data.resources]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    }
  }, [fetcher.data]);

  // Expose semester counts to layout
  useEffect(() => {
    (window as any).dashboardSemesterCounts = data.semesterCounts;
    window.dispatchEvent(new CustomEvent('dashboardCountsUpdated'));
    return () => {
      delete (window as any).dashboardSemesterCounts;
    };
  }, [data.semesterCounts]);

  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  const isAllowedFileType = (file: File) => {
    if (ALLOWED_TYPES.includes(file.type)) return true;
    const name = file.name.toLowerCase();
    return (
      name.endsWith('.pdf') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png')
    );
  };

  const getEffectiveContentType = (file: File) => {
    if (ALLOWED_TYPES.includes(file.type)) return file.type;
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.doc')) return 'application/msword';
    if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    if (name.endsWith('.png')) return 'image/png';
    return file.type || 'application/octet-stream';
  };

  const handleLoadMore = () => {
    if (!nextCursor || fetcher.state === 'submitting') return;

    const formData = new FormData();
    formData.append('intent', 'load-more');
    formData.append('cursor', nextCursor);

    const searchQuery = searchParams.get('search');
    const semester = searchParams.get('semester');
    const type = searchParams.get('type');

    if (searchQuery) formData.append('search', searchQuery);
    if (semester) formData.append('semester', semester);
    if (type && type !== 'all') formData.append('type', type);

    fetcher.submit(formData, { method: 'POST' });
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      dropJustHappenedRef.current = true;
      handleFileSelect(file);
      // Reset flag after a short delay so normal clicks work again
      setTimeout(() => { dropJustHappenedRef.current = false; }, 300);
    }
  };



  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setUploadMessage({ type: 'error', text: 'File too large. Maximum size is 20MB.' });
      return;
    }

    if (!isAllowedFileType(selectedFile)) {
      setUploadMessage({ type: 'error', text: 'Invalid file type. Only PDF, DOCX, JPG, PNG allowed.' });
      return;
    }

    const form = e.currentTarget;
    const baseFormData = new FormData(form);

    // Validate all required form fields BEFORE uploading
    const title = baseFormData.get('title') as string | null;
    const semester = baseFormData.get('semester') as string | null;
    const subject = baseFormData.get('subject') as string | null;
    const resource_type = baseFormData.get('resource_type') as string | null;

    if (!title?.trim() || !semester?.trim() || !subject?.trim() || !resource_type?.trim() || resource_type === 'Select Type') {
      setUploadMessage({ type: 'error', text: 'All fields are required. Please fill them' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase('prepare');
    setUploadMessage(null);

    try {
      // 1) Request presigned upload URL
      const prepareData = new FormData();
      prepareData.append('intent', 'get-upload-url');
      prepareData.append('fileName', selectedFile.name);
      const contentType = getEffectiveContentType(selectedFile);
      prepareData.append('fileType', contentType);
      prepareData.append('fileSize', String(selectedFile.size));

      const prepareResponse = await fetch('/api.r2-upload', {
        method: 'POST',
        body: prepareData,
      });

      const prepareJson = await prepareResponse.json();
      if (!prepareResponse.ok || !prepareJson.ok) {
        throw new Error(prepareJson?.error || 'Failed to prepare upload. Please try again.');
      }

      const uploadUrl: string = prepareJson.uploadUrl;
      const fileKey: string = prepareJson.fileKey;

      // 2) Upload directly to R2 with progress
      setUploadPhase('upload');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', getEffectiveContentType(selectedFile));

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error('Upload failed. Please try again.'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload. Please try again.'));

        xhr.send(selectedFile);
      });

      // 3) Confirm upload and create resource
      setUploadPhase('confirm');
      const confirmData = new FormData();
      confirmData.append('intent', 'confirm-upload');
      confirmData.append('fileKey', fileKey);
      confirmData.append('fileSize', String(selectedFile.size));

      const title = baseFormData.get('title');
      const semester = baseFormData.get('semester');
      const subject = baseFormData.get('subject');
      const resource_type = baseFormData.get('resource_type');

      if (title) confirmData.append('title', String(title));
      if (semester) confirmData.append('semester', String(semester));
      if (subject) confirmData.append('subject', String(subject));
      if (resource_type) confirmData.append('resource_type', String(resource_type));

      const confirmResponse = await fetch('/api.r2-upload', {
        method: 'POST',
        body: confirmData,
      });

      const confirmJson = await confirmResponse.json();
      if (!confirmResponse.ok || !confirmJson.ok) {
        throw new Error(confirmJson?.error || 'Failed to save resource. Please try again.');
      }

      setUploadMessage({ type: 'success', text: 'Resource uploaded successfully!' });

      setTimeout(() => {
        setUploadModalOpen(false);
        setSelectedFile(null);
        setUploadMessage(null);
        setUploadProgress(0);
        setUploadPhase('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
        navigate('.', { replace: true });
      }, 1200);
    } catch (error) {
      console.error('Upload error:', error);
      const message =
        error instanceof Error ? error.message : 'Something went wrong during upload. Please try again.';
      setUploadMessage({ type: 'error', text: message });
    } finally {
      setIsUploading(false);
    }
  };


  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];



  return (
    <DashboardShell onUploadClick={() => setUploadModalOpen(true)}>
      {/* Show error message if there is an error */}
      {data.error ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Unable to Load Resources</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">{data.error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#d97757] text-white px-6 py-3 rounded-lg hover:bg-[#c66847] transition-all font-medium"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Show resources or empty state */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allResources.length > 0 ? (
              allResources.map((resource: any) => (
                <ResourceCard key={resource.Id} resource={resource} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-12 text-center col-span-full">
                <div className="w-20 h-20 bg-[#d97757]/10 dark:bg-[#d97757]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-[#d97757]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {resourceType ? `No ${resourceType} Found` : 'No Resources Yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  {resourceType
                    ? `No resources match your current filter. Try selecting a different filter or upload a new ${resourceType.toLowerCase()} resource.`
                    : 'You haven\'t uploaded any resources yet. Start sharing your study materials with your classmates!'}
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-[#d97757] text-white px-6 py-3 rounded-lg hover:bg-[#c66847] transition-colors duration-200 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d97757]/50 focus:ring-offset-2">
                  {resourceType ? `Upload ${resourceType}` : 'Upload Your First Resource'}
                </button>
              </div>
            )}
          </div>

          {/* Show load more button if there are more resources */}
          {hasMore && (
            <div className="mt-8 text-center">
              {fetcher.data?.success === false && fetcher.data?.error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">{fetcher.data.error}</p>
                </div>
              )}
              <button
                onClick={handleLoadMore}
                disabled={fetcher.state === 'submitting'}
                className="px-8 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-[#d97757] hover:text-[#d97757] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {fetcher.state === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Resources</span>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Show upload modal if it is open */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm" onClick={() => setUploadModalOpen(false)}>
          <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Resource</h3>
              <button onClick={() => { setUploadModalOpen(false); setUploadMessage(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error/Success Message */}
            {uploadMessage && (
              <div className={`mb-4 p-3 rounded-lg ${uploadMessage.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                }`}>
                <p className="text-sm font-medium">{uploadMessage.text}</p>
              </div>
            )}

            <Form method="post" encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUploadSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Semester</label>
                <select name='semester' className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] outline-none text-gray-900 dark:text-gray-100">
                  <option value="">Select Semester</option>
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Subject Name</label>
                <input type="text" name='subject' placeholder="e.g., Data Structures" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Resource Type</label>
                <select name='resource_type' className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] outline-none text-gray-900 dark:text-gray-100">
                  <option>Select Type</option>
                  <option>Notes</option>
                  <option>Assignment</option>
                  <option>Quiz</option>
                  <option>Date Sheet</option>
                  <option>Syllabus</option>
                  <option>Past Papers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Resource Title</label>
                <input type="text" name='title' placeholder="e.g., Complete Chapter 3 Notes" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Upload File</label>
                <div
                  onClick={() => {
                    if (dropJustHappenedRef.current) return;
                    fileInputRef.current?.click();
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={handleDragDrop}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#d97757] transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  {selectedFile ? (
                    <>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-1 font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, JPG, PNG (Max 20MB)</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name='file'
                    accept='.pdf,.docx,.jpg,.png'
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="md:col-span-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                    <div
                      className="bg-[#d97757] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {uploadPhase === 'prepare' && 'Preparing upload...'}
                    {uploadPhase === 'upload' && `Uploading... ${uploadProgress}%`}
                    {uploadPhase === 'confirm' && 'Saving resource...'}
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-[#d97757] text-white py-3 rounded-lg hover:bg-[#c66847] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <article
          key={idx}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
        >
          {/* Header area matching ResourceCard */}
          <div className="bg-[#d97757]/10 dark:bg-[#d97757]/20 p-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-[#d97757]/20 dark:bg-[#d97757]/30 rounded-lg" />
              <div className="w-8 h-8 bg-[#d97757]/20 dark:bg-[#d97757]/30 rounded-lg" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-5 w-16 bg-[#d97757]/20 dark:bg-[#d97757]/30 rounded-full" />
            </div>
          </div>
          {/* Body area */}
          <div className="p-5 space-y-4">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 w-10 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-600 rounded-lg" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { resourcesData } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<DashboardShell><CardsSkeleton /></DashboardShell>}>
      <Await resolve={resourcesData}>
        {(data: DashboardData) => <DashboardContent data={data} />}
      </Await>
    </Suspense>
  );
}

// Dashboard Shell Component
function DashboardShell({ children, onUploadClick }: { children: React.ReactNode; onUploadClick?: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceType = searchParams.get('type') || null;

  const filterOptions = [
    { label: 'All Types', value: null, icon: Filter },
    { label: 'Notes', value: 'Notes' },
    { label: 'Assignment', value: 'Assignment' },
    { label: 'Quiz', value: 'Quiz' },
  ];

  const handleResourceTypeChange = (type: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (type && type !== 'all') {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Resources</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and organize your uploaded materials</p>
        </div>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center justify-center gap-2 bg-[#d97757] text-white px-5 py-2.5 rounded-lg hover:bg-[#c66847] transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#d97757]/50 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {filterOptions.map((option) => {
          const isActive = resourceType === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              onClick={() => handleResourceTypeChange(option.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${isActive
                  ? 'bg-[#d97757]/15 dark:bg-[#d97757]/25 text-[#d97757] dark:text-[#c66847] border-[#d97757]/30 dark:border-[#d97757]/40'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-[#d97757]/50 hover:text-[#d97757] text-gray-900 dark:text-gray-100'
                }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {children}
    </>
  );
}
