/** Catch-all params to the route string artifacts and pointers are keyed by. */
export function routeFromSlug(slug: readonly string[] | undefined): string {
  if (!slug || slug.length === 0) {
    return "/";
  }
  return `/${slug.join("/")}`;
}
