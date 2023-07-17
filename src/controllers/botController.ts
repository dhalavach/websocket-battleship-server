import { rooms } from '../db/roomDb.ts';
import { getUser } from '../models/userModel.ts';
import { Hit, Ship, WebSocketWithId } from './../types.ts';
import { mockShipData } from '../models/botModel.ts';
import { WebSocket } from 'ws';
import { checkIfHit, gameData, usersWithShips } from '../models/gameModel.ts';
import { sendMessage } from '../helpers.ts';
import { users } from '../db/userDb.ts';

export const handleSinglePlayMode = async (
  message: string,
  ws: WebSocketWithId,
) => {
  // console.log('handling single play mode');
  // console.log(
  //   'data from message on single play mode: ' + JSON.parse(message).data,
  // );
  //usersInGame.push(ws)

  //create hidden room
  const roomUsersObjArr = [
    {
      name: ws.id,
      index: getUser(ws.id)?.index,
    },
    {
      name: 'bot',
      index: Number(getUser(ws.id)?.index) + 1,
    },
  ];
  const id = rooms.size + 1;
  const roomUsersWsArray = [];
  roomUsersWsArray.push(ws);
  const botWs: WebSocketWithId = new WebSocket(
    'ws://localhost:3000',
  ) as WebSocketWithId;
  botWs.isAlive = true;
  botWs.id = 'bot';
  const botIndex = users.length + 1;
  const data: string = JSON.stringify({
    type: 'reg',
    data: JSON.stringify({
      name: 'bot',
      index: botIndex,
      error: false,
      errorText: '',
    }),
  });

  await sendMessage(botWs, data);
  roomUsersWsArray.push(botWs);
  const roomData = { roomId: id, roomUsers: roomUsersObjArr };
  const tempRoomsArr = [];
  tempRoomsArr.push(roomData);

  const room = {
    id,
    users: roomUsersWsArray,
  };
  rooms.set(id, room);

  // const playersInGame = rooms.get(id)?.users;
  // console.log(playersInGame?.map((p) => p.id));

  //handle ship placement

  const randomIndex = Math.floor(Math.random() * mockShipData.length);
  const ships: Ship[] = JSON.parse(mockShipData[randomIndex]).ships;

  const botShipsWithHitCapacity = ships.map((ship: Ship) => {
    return {
      position: {
        x: ship.position.x,
        y: ship.position.y,
      },
      direction: ship.direction,
      length: ship.length,
      hitCapacity: ship.length,
    };
  });

  gameData.set(id, {
    shipPlacementCounter: 1,
    activePlayerIndex: getUser(ws.id)?.index || 0,
  });
  usersWithShips.set('bot', botShipsWithHitCapacity);
  //create game

  ws.send(
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: id,
        idPlayer: getUser(ws.id)?.index,
      }),
      id: 0,
    }),
  );

  botWs.send(
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: id,
        idPlayer: Number(getUser(ws.id)?.index) + 1,
      }),
      id: 0,
    }),
  );

  botWs.send(
    // changed from ws.send
    JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: botShipsWithHitCapacity,
        currentPlayerIndex: getUser('bot')?.index,
      }),
      id: 0,
    }),
  );

  ws.send(
    JSON.stringify({
      type: 'turn',
      data: JSON.stringify({
        currentPlayer: getUser(ws.id)?.index,
      }),
      id: 0,
    }),
  );

  botWs.send(
    JSON.stringify({
      type: 'turn',
      data: JSON.stringify({
        currentPlayer: getUser(ws.id)?.index,
      }),
      id: 0,
    }),
  );

  //handle attack

  const botPastShots = new Set();

  const botAttack = (websocket: WebSocketWithId) => {
    if (botIndex === gameData.get(id)?.activePlayerIndex) {
      let x: number = Math.floor(Math.random() * 10);
      let y: number = Math.floor(Math.random() * 10);
      if (botPastShots.has(`${x}*${y}`)) {
        while (botPastShots.has(`${x}*${y}`)) {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * 10);
        }
      }

      botPastShots.add(`${x}*${y}`);

      const status: Hit | undefined = checkIfHit(
        websocket.id,
        usersWithShips.get(websocket.id) as Ship[],
        x,
        y,
      );

      const nextPlayerToShoot: number =
        status === 'shot' ? botIndex : (getUser(websocket.id)?.index as number); //activePlayerIndex : +!!!activePlayerIndex;

      gameData.set(id, {
        shipPlacementCounter: 2,
        activePlayerIndex: nextPlayerToShoot,
      });

      websocket.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: {
              x: x,
              y: y,
            },
            currentPlayer: botIndex,
            status: status,
          }),
          id: 0,
        }),
      );

      websocket.send(
        JSON.stringify({
          type: 'turn',
          data: JSON.stringify({
            currentPlayer: nextPlayerToShoot,
          }),
          id: 0,
        }),
      );
    }
  };

  setInterval(() => botAttack(ws), 7000);
};
