import WebSocket from 'ws';
import { WebSocketWithId } from '../types.ts';
import { rooms } from '../db/roomDb.ts';
import { getUser } from './userModel.ts';

export const updateListOfRooms = (ws: WebSocketWithId) => {

  console.log(rooms);
  if (rooms.size > 0) {
    const name = rooms.get(1)?.users[0] || '';
    const roomUsersObjArr = [
      {
        name: name,
        index: getUser(name)?.name,
      },
    ];
    const roomData = { roomId: 1, roomUsers: roomUsersObjArr };
    const tempRoomsArr = [];
    tempRoomsArr.push(roomData);

    const resp = JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(tempRoomsArr),
      id: 0,
    });

    ws.send(resp);
  }
};

export const roomUsersWsArr: WebSocketWithId[] = [];

export const clearRoom = () => {
  rooms.clear;
}
