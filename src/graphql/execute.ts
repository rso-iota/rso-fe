import type { TypedDocumentString } from "./graphql";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const response = await fetch(
    "https://rso-2.janvasiljevic.com/api/stats/public/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/graphql-response+json",
      },
      body: JSON.stringify({
        query: query,
        variables,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const json = await response.json();
  if (json.data) {
    return json.data as TResult;
  }

  return response.json() as TResult;
}
