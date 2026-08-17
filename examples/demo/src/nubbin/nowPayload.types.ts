/** The body of `/api/now`. One home for it: the route produces it and the resolver reads it. */
export interface NowPayload {
  now: number;
  served: number;
}
