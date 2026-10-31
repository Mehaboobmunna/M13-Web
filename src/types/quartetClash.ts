export interface Card {
  id: string;
  setId: string; // The 4-of-a-kind group, e.g. "LION", "TIGER", "EAGLE", "BEAR"
  name: string;
  icon: string;
  theme: string;
  numberInSet: number; // 1 to 4
  color: string;
  bgColor: string;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  score: number;
  completedQuartets: string[]; // setIds
  avatar: string;
}

export interface GameTheme {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }[];
}
