/** `/` maps to the bare prefix — `/preview/` and `/preview` are different URLs to Next. */
export function prefixedRoute(prefix: string, route: string): string {
  return route === "/" ? prefix : `${prefix}${route}`;
}
