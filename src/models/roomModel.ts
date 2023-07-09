import WebSocket from 'ws';
import { WebSocketWithId } from '../types.ts';
import { rooms } from '../db/roomDb.ts';
import { getUser } from './userModel.ts';



// export const roomUsersWsArr: WebSocketWithId[] = [];

export const clearRoom = () => {
  rooms.clear;
}
