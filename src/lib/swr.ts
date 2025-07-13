'use client';

import { Follower } from './server/db';
import useSWRBase, { SWRConfiguration, SWRResponse } from 'swr';

/**
 * A typed list of all available SWR keys and their corresponding return types.
 */
type APIRoutes = [
  '/api/followers',
  { ghosts: Follower[]; followers: Follower[] },
];
// i'll included more routes here as needed
// | ['/api/ghosts', Follower[]]

type SWRKey = APIRoutes[0];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type FetchResponse<K extends SWRKey> = Extract<APIRoutes, [K, any]>[1];

const fetcher = async <K extends SWRKey>(url: K): Promise<FetchResponse<K>> => {
  const res = await fetch(url as string);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function useSWR<K extends SWRKey>(
  key: K | null | undefined,
  options?: SWRConfiguration
): SWRResponse<FetchResponse<K>> {
  return useSWRBase(key, fetcher, options);
}
