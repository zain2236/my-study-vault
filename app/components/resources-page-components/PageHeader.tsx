import { Sparkles } from 'lucide-react';
import type { FilterState } from '~/client/resources/resource-filters';
import { SearchBar } from './SearchBar';
import { RefineDropdown } from './RefineDropdown';

interface PageHeaderProps {
  resourceCount: number;
  filters: FilterState;
  semesterCounts: Record<number, number>;
  refineCardOpen: boolean;
  onToggleRefine: () => void;
  onSearchChange: (value: string) => void;
  onSemesterChange: (sem: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}

export function PageHeader({
  resourceCount,
  filters,
  semesterCounts,
  refineCardOpen,
  onToggleRefine,
  onSearchChange,
  onSemesterChange,
  onTypeChange,
  onClearFilters
}: PageHeaderProps) {
  return (
    <div className="mb-10 lg:mb-12">
      {/* Badge */}
      <div className="inline-block mb-4">
        <span className="bg-[#d97757]/10 dark:bg-[#d97757]/20 text-[#d97757] px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Explore Community Resources</span>
        </span>
      </div>

      {/* Header with Search and Filter */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4">
        <div className="flex-1">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
            Browse All Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Discover <span className="font-semibold text-[#d97757]">{resourceCount}</span> study materials shared by our community of students
          </p>
        </div>
        
        {/* Search and Filter on the right - aligned with heading */}
        <div className="flex flex-col sm:flex-row gap-3 lg:items-start lg:pt-2 lg:w-[520px] lg:shrink-0">
          <SearchBar 
            searchQuery={filters.searchQuery} 
            onSearchChange={onSearchChange}
          />
          <RefineDropdown
            isOpen={refineCardOpen}
            onToggle={onToggleRefine}
            filters={filters}
            semesterCounts={semesterCounts}
            onSemesterChange={onSemesterChange}
            onTypeChange={onTypeChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </div>
    </div>
  );
}

