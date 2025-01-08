/* eslint-disable */
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type GlobalStats = {
  __typename?: "GlobalStats";
  botDeaths: Scalars["Int"]["output"];
  botFoodEaten: Scalars["Int"]["output"];
  botKills: Scalars["Int"]["output"];
  playerDeaths: Scalars["Int"]["output"];
  playerFoodEaten: Scalars["Int"]["output"];
  playerKills: Scalars["Int"]["output"];
};

export type Player = {
  __typename?: "Player";
  deaths: Scalars["Int"]["output"];
  foodEaten: Scalars["Int"]["output"];
  kills: Scalars["Int"]["output"];
};

export type Query = {
  __typename?: "Query";
  player?: Maybe<Player>;
  players?: Maybe<Array<Maybe<Player>>>;
  stats?: Maybe<GlobalStats>;
};

export type QueryPlayerArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryPlayersArgs = {
  ids?: InputMaybe<Array<InputMaybe<Scalars["ID"]["input"]>>>;
};

export type QueryQueryVariables = Exact<{
  ids?: InputMaybe<
    | Array<InputMaybe<Scalars["ID"]["input"]>>
    | InputMaybe<Scalars["ID"]["input"]>
  >;
}>;

export type QueryQuery = {
  __typename?: "Query";
  players?: Array<{
    __typename?: "Player";
    deaths: number;
    foodEaten: number;
    kills: number;
  } | null> | null;
  stats?: {
    __typename?: "GlobalStats";
    botDeaths: number;
    botKills: number;
    botFoodEaten: number;
    playerDeaths: number;
    playerKills: number;
    playerFoodEaten: number;
  } | null;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>["__apiType"];

  constructor(
    private value: string,
    public __meta__?: Record<string, any> | undefined
  ) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const QueryDocument = new TypedDocumentString(`
    query Query($ids: [ID]) {
  players(ids: $ids) {
    deaths
    foodEaten
    kills
  }
  stats {
    botDeaths
    botKills
    botFoodEaten
    playerDeaths
    playerKills
    playerFoodEaten
  }
}
    `) as unknown as TypedDocumentString<QueryQuery, QueryQueryVariables>;
