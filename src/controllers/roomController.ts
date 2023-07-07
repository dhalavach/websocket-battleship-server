import WebSocket from 'ws';
import { usersInGame } from '../models/gameModel.ts';
import { users, playerIndices } from '../models/userModel.ts';
import { websocketServer } from '../../index.ts';
import { WebSocketWithId } from '../types.ts';

export const createRoom = (message: string, ws: WebSocketWithId) => {
  const roomUsersArr = [
    {
      name: ws.id,
      index: usersInGame.length,
    },
  ];
  const roomsArr = [];
  const roomData = { roomId: roomsArr.length + 1, roomUsers: roomUsersArr };
  roomsArr.push(roomData);

  const userToAdd = users.find((user) => user.name === ws.id);
  if (userToAdd) usersInGame.push(userToAdd);

  const resp = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsArr),
    id: 0,
  });
  //console.log(resp);
  // ws.send(resp);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(resp);
    }
  });
};

export const addUsersToRoom = (message: string, ws: WebSocketWithId) => {
  console.log('message on add to room: ' + message);
  const userToAdd = users.find((user) => user.name === ws.id);
  if (userToAdd) usersInGame.push(userToAdd);
  console.log('users: ' + users.map((user) => user.name));
  console.log('users in game: ' + usersInGame.map((user) => user.name));
  const response = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({
      //  idGame: JSON.parse(JSON.parse(message).data).indexRoom,
      idGame: 1,
      idPlayer: playerIndices.get(ws.id),
    }),
    id: 0,
  });
  // console.log(response);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response);
    }
  });

  ws.send(response);
};
