import prisma from '~/server/prisma.server';

/**
 * Get all resources for a specific user
 * @param userId - The user ID
 * @returns Array of resources ordered by creation date (newest first)
 */
export async function getUserResources(userId: number) {
  return await prisma.resource.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Find a resource by ID and user ID (for ownership verification)
 * @param resourceId - The resource ID
 * @param userId - The user ID
 * @returns The resource if found, null otherwise
 */
export async function getUserResourceById(resourceId: number, userId: number) {
  return await prisma.resource.findFirst({
    where: { Id: resourceId, user_id: userId }
  });
}

/**
 * Update resource publish status
 * @param resourceId - The resource ID
 * @param isPublic - Whether the resource should be public
 * @returns The updated resource
 */
export async function updateResourcePublishStatus(resourceId: number, isPublic: boolean) {
  return await prisma.resource.update({
    where: { Id: resourceId },
    data: { isPublic }
  });
}

/**
 * Create a new resource
 * @param data - Resource data
 * @returns The created resource
 */
export async function createResource(data: {
  title: string;
  semester: number;
  subject: string;
  resource_type: string;
  file_path: string;
  file_size: bigint;
  user_id: number;
}) {
  return await prisma.resource.create({
    data: {
      title: data.title,
      semester: data.semester,
      subject: data.subject,
      resource_type: data.resource_type,
      file_path: data.file_path,
      file_size: data.file_size,
      user_id: data.user_id,
    }
  });
}

/**
 * Delete a resource by ID
 * @param resourceId - The resource ID
 * @returns The deleted resource
 */
export async function deleteResource(resourceId: number) {
  return await prisma.resource.delete({
    where: { Id: resourceId }
  });
}

/**
 * Get resource by ID (without user verification)
 * @param resourceId - The resource ID
 * @returns The resource if found, null otherwise
 */
export async function getResourceById(resourceId: number) {
  return await prisma.resource.findUnique({
    where: { Id: resourceId }
  });
}

/**
 * Get semester counts for a user's resources
 * @param userId - The user ID
 * @returns Object with semester numbers as keys and counts as values
 */
export async function getUserSemesterCounts(userId: number): Promise<Record<number, number>> {
  const resources = await prisma.resource.findMany({
    where: { user_id: userId },
    select: { semester: true }
  });

  const counts: Record<number, number> = {};
  resources.forEach(resource => {
    counts[resource.semester] = (counts[resource.semester] || 0) + 1;
  });

  return counts;
}

