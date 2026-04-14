import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import type { FilterState } from '~/client/resources/resource-filters';
import { hasActiveFilters } from '~/client/resources/resource-filters';
import { FilterButton } from './FilterButton';

interface RefineDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  semesterCounts: Record<number, number>;
  onSemesterChange: (sem: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}

export function RefineDropdown({
  isOpen,
  onToggle,
  filters,
  semesterCounts,
  onSemesterChange,
  onTypeChange,
  onClearFilters
}: RefineDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-5 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-600/50 rounded-xl shadow-sm dark:shadow-gray-900/20 hover:border-[#d97757] hover:shadow-md dark:hover:shadow-gray-900/40 hover:text-[#d97757] transition-all duration-300 whitespace-nowrap group"
      >
        <SlidersHorizontal className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-sm font-semibold">Refine</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={onToggle}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-700/95 backdrop-blur-md rounded-xl shadow-2xl dark:shadow-gray-900/50 border border-gray-200/60 dark:border-gray-600/50 z-20 overflow-hidden">
            <div className="p-5 space-y-5 max-h-96 overflow-y-auto">
              {/* Filter by Semester */}
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center space-x-2">
                  <span>Semester</span>
                  {filters.semester !== 'all' && (
                    <span className="px-2 py-0.5 bg-[#d97757] text-white text-xs rounded-full">
                      {filters.semester}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="All"
                    isActive={filters.semester === 'all'}
                    onClick={() => onSemesterChange('all')}
                  />
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <FilterButton
                      key={sem}
                      label={`Sem ${sem}`}
                      isActive={filters.semester === sem.toString()}
                      onClick={() => onSemesterChange(sem.toString())}
                      count={semesterCounts[sem]}
                    />
                  ))}
                </div>
              </div>

              {/* Filter by Type */}
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center space-x-2">
                  <span>Type</span>
                  {filters.type !== 'all' && (
                    <span className="px-2 py-0.5 bg-[#d97757] text-white text-xs rounded-full capitalize">
                      {filters.type}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="All"
                    isActive={filters.type === 'all'}
                    onClick={() => onTypeChange('all')}
                  />
                  {['Notes', 'Assignment', 'Quiz', 'Date Sheet', 'Past Papers'].map((type) => (
                    <FilterButton
                      key={type}
                      label={type}
                      isActive={filters.type === type.toLowerCase()}
                      onClick={() => onTypeChange(type.toLowerCase())}
                    />
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters(filters) && (
                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-600/50">
                  <button
                    onClick={onClearFilters}
                    className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#d97757] transition-colors group"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Clear all filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

