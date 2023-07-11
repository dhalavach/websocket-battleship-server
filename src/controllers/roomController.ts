import WebSocket from 'ws';
import { websocketServer } from '../index.ts';
import { RoomData, WebSocketWithId } from '../types.ts';
import { getUser } from '../models/userModel.ts';
import { rooms } from '../db/roomDb.ts';

export const createRoom = (message: string, ws: WebSocketWithId) => {
  const roomUsersObjArr = [
    {
      name: ws.id,
      index: getUser(ws.id)?.index,
    },
  ];
  const id = rooms.size + 1;
  const roomUsersWsArray = [];
  roomUsersWsArray.push(ws);
  const roomData = { roomId: id, roomUsers: roomUsersObjArr };
  const tempRoomsArr = [];
  tempRoomsArr.push(roomData);

  const room = {
    id,
    users: roomUsersWsArray,
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
  const indexRoom = JSON.parse(JSON.parse(message).data).indexRoom || 1; // refactor
  const roomCreator = rooms.get(indexRoom)?.users[0] || ws; //  v. bad
  if (roomCreator?.id !== ws.id) {
    const newUsersArr = [];
    newUsersArr.push(roomCreator);
    newUsersArr.push(ws);
    const newRoom = {
      id: indexRoom,
      users: newUsersArr,
    };
    rooms.set(indexRoom, newRoom);
  }
  console.log('message on add to room: ' + message);
  // const userToAdd = users.find((user) => user.name === ws.id);
  // if (userToAdd) usersInGame.push(userToAdd);
  // console.log('users: ' + users.map((user) => user.name));
  // console.log('users in game: ' + usersInGame.map((user) => user.name));

  // const roomId = JSON.parse(JSON.parse(message).data).indexRoom;

  // const newRoomUsersStringArr = rooms.get(roomId)?.users || [];
  // if (userToAdd && newRoomUsersStringArr)
  //   newRoomUsersStringArr.push(userToAdd.name);
  // const updatedRoom = {
  //   id: roomId,
  //   users: newRoomUsersStringArr,
  // };
  // rooms.set(roomId, updatedRoom);

  // console.log('parsed roomId: ' + roomId);

  const usersInGame = rooms.get(indexRoom)?.users;
  usersInGame?.forEach((user: WebSocketWithId) => {
    user.send(
      JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame: indexRoom,
          idPlayer: getUser(user.id)?.index,
        }),
        id: 0,
      }),
    );
  });
};

export const getListOfRooms = (ws: WebSocketWithId) => {
  if (rooms.size > 0) {
    const tempRoomsArr: RoomData[] = [];
    rooms.forEach((value, key) => {
      tempRoomsArr.push({
        roomId: key,
        roomUsers: value.users,
      });
    });

    const resp = JSON.stringify({
      type: 'update_room',
      data: JSON.stringify(tempRoomsArr),
      id: 0,
    });

    ws.send(resp);
  }
};
