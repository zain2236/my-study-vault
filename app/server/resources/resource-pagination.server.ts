import prisma from '~/server/prisma.server';
import { transformResource, type TransformedResource } from './resource-transform.server';
import { 
  parseCursor, 
  createSearchConditions, 
  DEFAULT_PAGE_SIZE,
  type CursorPaginationParams,
  type CursorPaginationResult 
} from '~/server/pagination/cursor-pagination.server';


export interface ResourcePaginationParams extends CursorPaginationParams {
  semester?: number;
  resourceType?: string;
  userId?: number; // Optional: if provided, filter by user_id instead of isPublic
}

/**
 * Fetches resources with cursor-based pagination
 */
export async function getPaginatedResources(
  params: ResourcePaginationParams
): Promise<CursorPaginationResult<TransformedResource>> {
  const {
    cursor,
    limit = DEFAULT_PAGE_SIZE,
    searchQuery,
    semester,
    resourceType
  } = params;

  const cursorId = parseCursor(cursor);
  const searchConditions = createSearchConditions(searchQuery);
  const hasSearch = Object.keys(searchConditions).length > 0;

  // Build base filters - if userId provided, filter by user, otherwise filter by isPublic
  const baseFilters: any = params.userId
    ? { user_id: params.userId }
    : { isPublic: true };

  if (semester && semester > 0) {
    baseFilters.semester = semester;
  }

  if (resourceType && resourceType !== 'all') {
    baseFilters.resource_type = {
      equals: resourceType,
      mode: 'insensitive'
    };
  }

  // Combine filters: if we have search, use AND to combine base filters with search
  const where: any = hasSearch
    ? {
        AND: [
          baseFilters,
          searchConditions
        ]
      }
    : baseFilters;

  // Add cursor condition for pagination
  if (cursorId) {
    // Get the cursor resource to find its created_at timestamp
    const cursorResource = await prisma.resource.findUnique({
      where: { Id: cursorId },
      select: { created_at: true }
    });

    if (cursorResource) {
      // Fetch resources created before the cursor resource
      const cursorCondition = {
        created_at: {
          lt: cursorResource.created_at
        }
      };

      // If we have AND clause, add cursor to it, otherwise add directly
      if (where.AND) {
        where.AND.push(cursorCondition);
      } else {
        where.created_at = cursorCondition.created_at;
      }
    }
  }

  // Fetch one extra to check if there are more
  const take = limit + 1;

  const resources = await prisma.resource.findMany({
    where,
    include: {
      user: {
        select: {
          user_name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take
  });

  // Check if there are more items
  const hasMore = resources.length > limit;
  const items = hasMore ? resources.slice(0, limit) : resources;

  // Transform resources only if not user-specific (for dashboard, return raw resources)
  if (params.userId) {
    // Return raw resources for dashboard
    const nextCursor = items.length > 0 ? items[items.length - 1].Id.toString() : null;
    return {
      items: items as any,
      nextCursor: hasMore ? nextCursor : null,
      hasMore
    };
  } else {
    // Transform for public resources page
    const transformedItems = items.map(transformResource);
    const nextCursor = transformedItems.length > 0 
      ? transformedItems[transformedItems.length - 1].id.toString()
      : null;
    return {
      items: transformedItems,
      nextCursor: hasMore ? nextCursor : null,
      hasMore
    };
  }
}

/**
 * Gets total count of public resources (for stats)
 * Re-exported from resource-prisma.server for backward compatibility
 */
export { getTotalPublicResourceCount as getTotalResourceCount } from '~/server/prisma/resource-prisma.server';

/**
 * Gets total count of users (for stats)
 * Re-exported from resource-prisma.server for backward compatibility
 */
export { getTotalUserCount } from '~/server/prisma/resource-prisma.server';

