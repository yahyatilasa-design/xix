
/**
 * Generates a URL-friendly slug from a string.
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Removes consecutive hyphens
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};
