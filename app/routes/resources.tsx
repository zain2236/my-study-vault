import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useLoaderData, useFetcher, useSearchParams, Await, type MetaFunction } from 'react-router';

import { BrowseResourceCard } from '~/components/resources-page-components/BrowseResourceCard';
import { PageHeader } from '~/components/resources-page-components/PageHeader';
import { StatsBanner } from '~/components/resources-page-components/StatsBanner';
import { EmptyState } from '~/components/resources-page-components/EmptyState';
import { LoadMoreButton } from '~/components/resources-page-components/LoadMoreButton';
import { getPaginatedResources, getTotalResourceCount, getTotalUserCount } from '~/utils/resources/resource-pagination.server';
import { 
  calculateSemesterCounts, 
  type FilterState 
} from '~/utils/resources/resource-filters';
import type { TransformedResource } from '~/utils/resources/resource-transform.server';
import { useDebounce } from '~/utils/hooks/use-debounce';

export const meta: MetaFunction = () => {
  return [
    { title: 'Browse Resources - Study Vault | Smart Search & Pagination' },
    { 
      name: 'description', 
      content: 'Explore thousands of educational resources on Study Vault. Use our smart search with debouncing and easy pagination to find study materials by subject, semester, and type. Download PDFs, notes, and study guides instantly.' 
    },
    { 
      name: 'keywords', 
      content: 'browse resources, study materials, educational resources, search notes, filter by subject, semester resources, PDF download, study guides, exam notes, course materials, paginated search, instant search, debounced search' 
    },
    
    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/resources' },
    { property: 'og:title', content: 'Browse Educational Resources - Study Vault' },
    { 
      property: 'og:description', 
      content: 'Find the perfect study materials with smart search and pagination. Filter by subject, semester, and type. Thousands of resources available for instant download.' 
    },
    { property: 'og:site_name', content: 'Study Vault' },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Browse Educational Resources - Study Vault' },
    { 
      name: 'twitter:description', 
      content: 'Find the perfect study materials with smart search and pagination. Filter by subject, semester, and type.' 
    },
    
    // Additional SEO
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'theme-color', content: '#d97757' },
    
    // Schema.org markup for search functionality
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Educational Resources',
        description: 'Browse and search thousands of educational resources organized by subject and semester',
        url: 'https://studyvault.com/resources',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Study Resources',
          description: 'Educational materials uploaded and shared by students'
        }
      }
    },
  ];
};


// Prevent revalidation for load-more and download fetcher actions
export function shouldRevalidate({ formData, defaultShouldRevalidate }: { formData?: FormData; defaultShouldRevalidate: boolean; [key: string]: any }) {
  const intent = formData?.get('intent');
  if (intent === 'load-more' || intent === 'download') {
    return false;
  }
  return defaultShouldRevalidate;
}

// Loader function
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const searchQuery = url.searchParams.get('search') || undefined;
  const semester = url.searchParams.get('semester') || undefined;
  const resourceType = url.searchParams.get('type') || undefined;

  const resourcesPromise: Promise<ResourcesData> = (async () => {
    try {
      const [paginationResult, totalCount, userCount] = await Promise.all([
        getPaginatedResources({
          cursor,
          searchQuery,
          semester: semester ? parseInt(semester, 10) : undefined,
          resourceType: resourceType !== 'all' ? resourceType : undefined
        }),
        getTotalResourceCount(),
        getTotalUserCount()
      ]);

      return {
        resources: paginationResult.items as TransformedResource[],
        nextCursor: paginationResult.nextCursor as string | null,
        hasMore: paginationResult.hasMore as boolean,
        totalCount,
        userCount,
        error: null,
      };
    } catch {
      return {
        resources: [] as TransformedResource[],
        nextCursor: null,
        hasMore: false,
        totalCount: 0,
        userCount: 0,
        error: 'Something went wrong. Please try again.',
      };
    }
  })();

  return {
    resourcesData: resourcesPromise,
  };
}

// Action function for loading more resources
export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'load-more') {
      const cursor = formData.get('cursor') as string | null;
      const searchQuery = formData.get('search') as string | null;
      const semester = formData.get('semester') as string | null;
      const resourceType = formData.get('type') as string | null;

      const result = await getPaginatedResources({
        cursor: cursor || undefined,
        searchQuery: searchQuery || undefined,
        semester: semester ? parseInt(semester, 10) : undefined,
        resourceType: resourceType && resourceType !== 'all' ? resourceType : undefined
      });

      return {
        resources: result.items,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        success: true
      };
    }

    // Handle download — validate resource & file existence, return download URL
    if (intent === 'download') {
      const resourceId = formData.get('resourceId');
      if (!resourceId) return { error: 'Resource ID is required' };

      try {
        const { getResourceForDownload } = await import('~/utils/prisma/resource-prisma.server');
        const resource = await getResourceForDownload(Number(resourceId));
        if (!resource) {
          return { error: 'Resource not found. It may have been deleted.' };
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
        // The actual download route (/download/:id) handles incrementing the download count.
        return {
          success: true,
          downloadUrl: `/download/${resourceId}`
        };
      } catch (error) {
        return { error: 'Download failed. Please try again.' };
      }
    }

    return { success: false, error: 'Invalid action' };
  } catch (error) {
    return { success: false, error: 'Failed to load more resources' };
  }
}

type ResourcesData = {
  resources: TransformedResource[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
  userCount: number;
  error: string | null;
};

type BrowseResourcesContentProps = {
  data: ResourcesData;
};

function BrowseResourcesContent({ data }: BrowseResourcesContentProps) {
  const fetcher = useFetcher<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Handle error messages from URL params (from download redirects)
  const errorParam = searchParams.get('error');
  
  // Error messages mapping
  const errorMessages: Record<string, string> = {
    'invalid-resource': 'Invalid resource ID. Please try again.',
    'resource-not-found': 'Resource not found. It may have been deleted.',
    'file-not-found': 'File not found in storage. The resource may have been removed.',
    'file-read-error': 'Failed to read file. Please try again later.',
    'download-failed': 'Download failed. Please try again later.'
  };

  // Clear error from URL after showing
  useEffect(() => {
    if (errorParam && errorMessages[errorParam]) {
      const params = new URLSearchParams(searchParams);
      params.delete('error');
      setSearchParams(params, { replace: true });
    }
  }, [errorParam, searchParams, setSearchParams]);
  
  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    semester: searchParams.get('semester') || 'all',
    type: searchParams.get('type') || 'all',
    searchQuery: searchParams.get('search') || ''
  }));
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);
  
  const [refineCardOpen, setRefineCardOpen] = useState(false);
  const [allResources, setAllResources] = useState<TransformedResource[]>(data.resources);
  const [nextCursor, setNextCursor] = useState<string | null>(data.nextCursor);
  const [hasMore, setHasMore] = useState(data.hasMore);

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

  // Calculate semester counts from all loaded resources
  const semesterCounts = useMemo(() => {
    return calculateSemesterCounts(allResources);
  }, [allResources]);

  // Update URL params when filters change (using debounced search query)
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchQuery) {
      params.set('search', debouncedSearchQuery);
    }
    
    if (filters.semester !== 'all') {
      params.set('semester', filters.semester);
    }
    
    if (filters.type !== 'all') {
      params.set('type', filters.type);
    }
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearchQuery, filters.semester, filters.type, setSearchParams]);

  // Handlers
  const handleSemesterChange = useCallback((sem: string) => {
    setFilters(prev => ({ ...prev, semester: sem }));
    setAllResources([]);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, type }));
    setAllResources([]);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      semester: 'all',
      type: 'all',
      searchQuery: ''
    });
    setAllResources([]);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || fetcher.state === 'submitting') return;

    const formData = new FormData();
    formData.append('intent', 'load-more');
    formData.append('cursor', nextCursor);
    if (filters.searchQuery) formData.append('search', filters.searchQuery);
    if (filters.semester !== 'all') formData.append('semester', filters.semester);
    if (filters.type !== 'all') formData.append('type', filters.type);

    fetcher.submit(formData, { method: 'POST' });
  }, [nextCursor, filters.searchQuery, filters.semester, filters.type, fetcher.state, fetcher]);

  const isLoadingMore = fetcher.state === 'submitting';



  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-800 py-8 lg:py-12">
      {/* Background decorations */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-[#d97757] opacity-5 dark:opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#d97757] opacity-5 dark:opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Error Message */}
        {errorParam && errorMessages[errorParam] && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMessages[errorParam]}</p>
          </div>
        )}
        <PageHeader
          resourceCount={data.totalCount}
          filters={filters}
          semesterCounts={semesterCounts}
          refineCardOpen={refineCardOpen}
          onToggleRefine={() => setRefineCardOpen(!refineCardOpen)}
          onSearchChange={handleSearchChange}
          onSemesterChange={handleSemesterChange}
          onTypeChange={handleTypeChange}
          onClearFilters={handleClearFilters}
        />
        
        <StatsBanner resourceCount={data.totalCount} userCount={data.userCount} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-[#d97757]">{allResources.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">{data.totalCount}</span> resources
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        {allResources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {allResources.map((resource) => (
                <BrowseResourceCard
                  key={resource.id}
                  resource={resource}
                />
              ))}
            </div>

            {hasMore && (
              <LoadMoreButton 
                onClick={handleLoadMore} 
                isLoading={isLoadingMore}
              />
            )}
          </>
        ) : (
          <EmptyState onClearFilters={handleClearFilters} />
        )}
      </div>
    </div>
  );
}

function BrowseResourcesFallback() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-800 py-8 lg:py-12">
      <div className="fixed top-20 right-10 w-72 h-72 bg-[#d97757] opacity-5 dark:opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#d97757] opacity-5 dark:opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 space-y-4">
          <div className="h-6 w-48 bg-gray-400 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-4 w-80 bg-gray-400 dark:bg-gray-700 rounded-md animate-pulse" />
          <div className="h-10 w-full max-w-xl bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg animate-pulse" />
        </div>

        <div className="mb-6 h-24 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl animate-pulse" />

        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-64 bg-gray-400 dark:bg-gray-700 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-700 rounded-xl p-6 space-y-4 border border-gray-300/70 dark:border-gray-600/70 animate-pulse"
            >
              <div className="h-4 w-24 bg-gray-400 dark:bg-gray-600 rounded-full" />
              <div className="h-5 w-3/4 bg-gray-400 dark:bg-gray-600 rounded-full" />
              <div className="h-3 w-full bg-gray-400 dark:bg-gray-600 rounded-full" />
              <div className="h-3 w-5/6 bg-gray-400 dark:bg-gray-600 rounded-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-20 bg-gray-400 dark:bg-gray-600 rounded-full" />
                <div className="h-8 w-24 bg-gray-400 dark:bg-gray-600 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function BrowseResourcesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { resourcesData } = loaderData as {
    resourcesData: Promise<ResourcesData>;
  };

  return (
    <Suspense fallback={<BrowseResourcesFallback />}>
      <Await 
        resolve={resourcesData}
        errorElement={
          <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-800 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  An unexpected error occurred. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-[#d97757] text-white rounded-lg hover:bg-[#c86647] transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        }
      >
        {(data: ResourcesData) => (
          <BrowseResourcesContent data={data} />
        )}
      </Await>
    </Suspense>
  );
}
