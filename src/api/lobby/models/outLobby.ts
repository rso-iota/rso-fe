/**
 * Generated by orval v7.3.0 🍺
 * Do not edit manually.
 * OpenAPI definition
 * OpenAPI spec version: v0
 */
import type { OutLiveData } from "./outLiveData";

export interface OutLobby {
  archived: boolean;
  createdAt: string;
  currentPlayers: number;
  gameId: string;
  id: string;
  liveData: OutLiveData[];
  maxPlayers: number;
  name: string;
  owner: string;
  serverId: string;
}
