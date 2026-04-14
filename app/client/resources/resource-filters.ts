import type { TransformedResource } from '~/server/resources/resource-transform.server';

export interface FilterState {
  semester: string;
  type: string;
  searchQuery: string;
}

/**
 * Filters resources based on semester, type, and search query
 */
export function filterResources(
  resources: TransformedResource[],
  filters: FilterState
): TransformedResource[] {
  if (!resources || resources.length === 0) return [];

  return resources.filter(resource => {
    const matchesSemester = 
      filters.semester === 'all' || 
      resource.semester.toString() === filters.semester;
    
    const matchesType = 
      filters.type === 'all' || 
      resource.type.toLowerCase() === filters.type.toLowerCase();
    
    if (!matchesSemester || !matchesType) return false;
    
    if (filters.searchQuery === '') return true;
    
    const query = filters.searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) || 
      resource.subject.toLowerCase().includes(query)
    );
  });
}

/**
 * Calculates semester counts for filter badges
 */
export function calculateSemesterCounts(
  resources: TransformedResource[]
): Record<number, number> {
  if (!resources || resources.length === 0) return {};
  
  return [1, 2, 3, 4, 5, 6, 7, 8].reduce((acc, sem) => {
    acc[sem] = resources.filter(r => r.semester === sem).length;
    return acc;
  }, {} as Record<number, number>);
}

/**
 * Checks if any filters are active
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.semester !== 'all' || 
    filters.type !== 'all' || 
    filters.searchQuery !== ''
  );
}

