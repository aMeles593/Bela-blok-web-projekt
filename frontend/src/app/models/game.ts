export interface GameHistory {
  id: number;
  target_score: number;
  started_at: string;
  finished_at: string;

  team1_party_wins: number;
  team2_party_wins: number;

  party_count: number;
  players: string;
}