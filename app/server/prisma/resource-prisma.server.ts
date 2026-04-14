import prisma from '~/server/prisma.server';

/**
 * Get resource by ID without incrementing download count
 * @param resourceId - The resource ID
 * @returns The resource with file_path and title, or null if not found
 */
export async function getResourceForDownload(resourceId: number) {
  return await prisma.resource.findUnique({
    where: { Id: resourceId },
    select: { file_path: true, title: true, isPublic: true }
  });
}

/**
 * Increment download count for a resource
 * @param resourceId - The resource ID
 * @returns The updated resource with file_path and title
 */
export async function incrementResourceDownload(resourceId: number) {
  return await prisma.resource.update({
    where: { Id: resourceId },
    data: { downloads: { increment: 1 } },
    select: { file_path: true, title: true }
  });
}

/**
 * Get total count of public resources
 * @returns Total count of public resources
 */
export async function getTotalPublicResourceCount(): Promise<number> {
  return await prisma.resource.count({
    where: {
      isPublic: true
    }
  });
}

/**
 * Get total count of all resources (public and private)
 * @returns Total count of all resources
 */
export async function getTotalResourceCount(): Promise<number> {
  return await prisma.resource.count();
}

/**
 * Get total count of users
 * @returns Total count of users
 */
export async function getTotalUserCount(): Promise<number> {
  return await prisma.user.count();
}

