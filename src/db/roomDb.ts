import { Room } from './../types.ts';

// export type Room = {
//   id: number;
//  // users: Map<number, string>;
//  users: WebSocketWithId[]
// }

export const rooms: Map<number, Room> = new Map();
