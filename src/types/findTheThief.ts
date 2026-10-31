export type CourtRoleId =
  | 'KING'
  | 'QUEEN'
  | 'BISHOP'
  | 'KNIGHT'
  | 'ROOK'
  | 'DUKE'
  | 'BARON'
  | 'SQUIRE'
  | 'PAWN'
  | 'THIEF';

export interface CourtRole {
  id: CourtRoleId;
  name: string;
  pts: number;
  color: string;
  border: string;
  text: string;
  badge: string;
  order: number;
}

export interface ThiefPlayer {
  id: string;
  name: string;
  score: number;
  roleId: CourtRoleId | null;
  isBot: boolean;
  avatar: string;
}

export type GameStateStatus = 'LOBBY' | 'ROLES_ASSIGNED' | 'SEEKING' | 'ROUND_END' | 'GAME_OVER';

export interface GameLog {
  id: string;
  text: string;
  type: 'info' | 'accusation' | 'success' | 'failure' | 'score';
  timestamp: number;
}
