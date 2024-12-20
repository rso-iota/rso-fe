/**
 * Generated by orval v7.3.0 🍺
 * Do not edit manually.
 * Authenticator SVC
 * API docs
 */
import { useQuery } from "@tanstack/react-query";
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { OutError } from ".././models";
import { customInstance } from "../../mutator/custom-instance";
import type { ErrorType } from "../../mutator/custom-instance";

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

/**
 * Uses the access token stored in the "Authorization" header to check if the user is authenticated.
The check if performed to the Keycloak server.

If th e "X-Forwarded-Uri" includes "public" the request is allowed through without authentication.
This is used for the public paths, such as the OpenAPI documentation.

 * @summary Authenticates forward auth request from traefik
 */
export const getAuth = (
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal,
) => {
  return customInstance<void>(
    { url: `/api/auth/auth`, method: "GET", signal },
    options,
  );
};

export const getGetAuthQueryKey = () => {
  return [`/api/auth/auth`] as const;
};

export const getGetAuthQueryOptions = <
  TData = Awaited<ReturnType<typeof getAuth>>,
  TError = ErrorType<OutError>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getAuth>>, TError, TData>
  >;
  request?: SecondParameter<typeof customInstance>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAuthQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getAuth>>> = ({
    signal,
  }) => getAuth(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getAuth>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetAuthQueryResult = NonNullable<
  Awaited<ReturnType<typeof getAuth>>
>;
export type GetAuthQueryError = ErrorType<OutError>;

export function useGetAuth<
  TData = Awaited<ReturnType<typeof getAuth>>,
  TError = ErrorType<OutError>,
>(options: {
  query: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getAuth>>, TError, TData>
  > &
    Pick<
      DefinedInitialDataOptions<
        Awaited<ReturnType<typeof getAuth>>,
        TError,
        TData
      >,
      "initialData"
    >;
  request?: SecondParameter<typeof customInstance>;
}): DefinedUseQueryResult<TData, TError> & {
  queryKey: DataTag<QueryKey, TData>;
};
export function useGetAuth<
  TData = Awaited<ReturnType<typeof getAuth>>,
  TError = ErrorType<OutError>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getAuth>>, TError, TData>
  > &
    Pick<
      UndefinedInitialDataOptions<
        Awaited<ReturnType<typeof getAuth>>,
        TError,
        TData
      >,
      "initialData"
    >;
  request?: SecondParameter<typeof customInstance>;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetAuth<
  TData = Awaited<ReturnType<typeof getAuth>>,
  TError = ErrorType<OutError>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getAuth>>, TError, TData>
  >;
  request?: SecondParameter<typeof customInstance>;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
/**
 * @summary Authenticates forward auth request from traefik
 */

export function useGetAuth<
  TData = Awaited<ReturnType<typeof getAuth>>,
  TError = ErrorType<OutError>,
>(options?: {
  query?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof getAuth>>, TError, TData>
  >;
  request?: SecondParameter<typeof customInstance>;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetAuthQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
