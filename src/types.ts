import { WebSocket } from 'ws';

export type Message = {
  type?: string;
  data?: string;
  id?: number;
};

export type User = {
  index: number;
  name: string;
  password: string;
  victories: number;
};

export type Room = {
  id: number;
  users: WebSocketWithId[];
};

export type Hit = 'miss' | 'killed' | 'shot';

export type Ship = {
  position: { x: number; y: number };
  direction: boolean;
  type?: 'small' | 'medium' | 'large' | 'huge';
  length: number;
  hitCapacity?: number;
};

export type WebSocketWithId = WebSocket & {
  id: string;
  isAlive: boolean;
};

export type userWinInfo = {
  name: string;
  wins: number;
};

export type GameParameters = {
  shipPlacementCounter: number;
  activePlayerIndex: number;
};

export type RoomData = {
  roomId: number,
  roomUsers: WebSocketWithId[],
}
