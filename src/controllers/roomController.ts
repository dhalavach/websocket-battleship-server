import WebSocket from 'ws';
import { usersInGame } from '../models/gameModel.ts';
import { users } from '../models/userModel.ts';
import { websocketServer } from '../../index.ts';

export const createRoom = (message: string) => {
  // const roomUsersArr = [
  //   {
  //     name: 'Logan',
  //     index: 1,
  //   },
  //   {
  //     name: 'asdf@email.com',
  //     index: 2,
  //   },
  // ];
  const roomsArr = [];
  const roomData = { roomId: roomsArr.length + 1, roomUsers: users };
  roomsArr.push(roomData);
  const resp = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsArr),
    id: 0,
  });
  console.log(resp);
  // ws.send(resp);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(resp);
    }
  });
};

export const addUsersToRoom = (message: string) => {
  usersInGame.push(users[0]);
  usersInGame.push(users[1]);
  console.log(usersInGame);
  const response = JSON.stringify({
    type: 'create_game',
    data: JSON.stringify({
      idGame: JSON.parse(JSON.parse(message).data).indexRoom,
      idPlayer: users[0],
    }),
    id: 0,
  });
  // console.log(response);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response);
    }
  });
  // ws.send(response);
};
