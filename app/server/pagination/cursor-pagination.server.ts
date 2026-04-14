/**
 * Cursor pagination utilities for server-side pagination
 */

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  searchQuery?: string;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Default page size for pagination
 */
export const DEFAULT_PAGE_SIZE = 6;

/**
 * Parses cursor from string (resource ID)
 */
export function parseCursor(cursor?: string): number | undefined {
  if (!cursor) return undefined;
  const parsed = parseInt(cursor, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Creates search conditions for Prisma query
 */
export function createSearchConditions(searchQuery?: string) {
  if (!searchQuery || searchQuery.trim() === '') {
    return {};
  }

  const query = searchQuery.trim();
  
  return {
    OR: [
      {
        title: {
          contains: query,
          mode: 'insensitive' as const
        }
      },
      {
        subject: {
          contains: query,
          mode: 'insensitive' as const
        }
      }
    ]
  };
}

