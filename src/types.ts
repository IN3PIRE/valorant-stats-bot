export interface ValorantStats {
  username: string;
  tag: string;
  puuid: string;
  region: string;
  stats: {
    rating: number;
    matchesPlayed: number;
    wins: number;
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
  };
}
