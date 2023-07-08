import WebSocket from 'ws';
import { usersInGame } from '../models/gameModel.ts';
import { users } from '../db/userDb.ts';
import { websocketServer } from '../../index.ts';
import { WebSocketWithId } from '../types.ts';
import { getUser } from '../models/userModel.ts';
import { rooms } from '../db/roomDb.ts';
import { roomUsersWsArr } from '../models/roomModel.ts';

export const createRoom = (message: string, ws: WebSocketWithId) => {
  roomUsersWsArr.push(ws);
  const roomUsersObjArr = [
    {
      name: ws.id,
      index: getUser(ws.id)?.index,
    },
  ];
  const id = rooms.size + 1;
  const roomUsersStringArr = roomUsersObjArr.map((u) => u.name);
  const roomData = { roomId: id, roomUsers: roomUsersObjArr };
  const tempRoomsArr = [];
  tempRoomsArr.push(roomData);

  const room = {
    id,
    users: roomUsersStringArr,
  };
  rooms.set(id, room);


  const resp = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(tempRoomsArr),
    id: 0,
  });

  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(resp);
    }
  });
};

export const addUsersToRoom = (message: string, ws: WebSocketWithId) => {
  if (roomUsersWsArr[0].id !== ws.id) roomUsersWsArr.push(ws);
  console.log('message on add to room: ' + message);
  const userToAdd = users.find((user) => user.name === ws.id);
  // if (userToAdd) usersInGame.push(userToAdd);
  console.log('users: ' + users.map((user) => user.name));
  // console.log('users in game: ' + usersInGame.map((user) => user.name));

  const roomId = JSON.parse(JSON.parse(message).data).indexRoom;

  const newRoomUsersStringArr = rooms.get(roomId)?.users || [];
  if (userToAdd && newRoomUsersStringArr)
    newRoomUsersStringArr.push(userToAdd.name);
  const updatedRoom = {
    id: roomId,
    users: newRoomUsersStringArr,
  };
  rooms.set(roomId, updatedRoom);

  console.log('parsed roomId: ' + roomId);


  roomUsersWsArr.forEach((user: WebSocketWithId) => {
    user.send(
      JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame: roomId,
          idPlayer: getUser(user.id)?.index,
        }),
        id: 0,
      }),
    );
  });

  // ws.send(response);
};
