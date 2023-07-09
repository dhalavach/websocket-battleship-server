import { WebSocket, WebSocketServer } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  usersInGame,
} from './../models/gameModel.ts';
import { Ship, User, WebSocketWithId } from '../types.ts';
import { users } from '../db/userDb.ts';
import { getUser } from '../models/userModel.ts';
import { websocketServer } from '../../index.ts';
import { rooms } from '../db/roomDb.ts';
import { roomUsersWsArr } from '../models/roomModel.ts';

let shipPlacementCounter = 0;

export const handleAddShips = (message: string, ws: WebSocketWithId) => {
  console.log(ws.id);

  shipPlacementCounter++;

  const ships = JSON.parse(JSON.parse(message).data).ships;
  const indexPlayer = JSON.parse(JSON.parse(message).data).indexPlayer;
  console.log('index player from add ships message ' + indexPlayer);
  console.log('ws id from add ships: ' + ws.id);

  const shipsWithHitCapacity = ships.map((ship: Ship) => {
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
  usersWithShips.set(ws.id, shipsWithHitCapacity);

  function checkFlag() {
    if (shipPlacementCounter !== 2) {
      setTimeout(checkFlag, 1000);
    } else {
      roomUsersWsArr.forEach((user) => {
        console.log(user.id + '----' + usersWithShips.get(user.id));
        user.send(
          // change to ws
          JSON.stringify({
            type: 'start_game',
            data: JSON.stringify({
              ships: usersWithShips.get(user.id),
              currentPlayerIndex: getUser(user.id)?.index, // change back to user.id,
            }),
            id: 0,
          }),
        );
        ws.send(
          JSON.stringify({
            type: 'turn',
            data: JSON.stringify({
              currentPlayer: 1,
            }),
            id: 0,
          }),
        );
      });
    }
  }
  checkFlag();
};

export const handleAttack = (message: string, ws: WebSocketWithId) => {
  console.log('message on attack:' + JSON.parse(message).data);
  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;

  roomUsersWsArr.forEach((user) => {
    const enemy = roomUsersWsArr.filter((u) => u.id !== ws.id)[0];
    const status = checkIfHit(usersWithShips.get(enemy.id), x, y);
    const currentPlayer = JSON.parse(JSON.parse(message).data).indexPlayer;
    console.log('currentPlayer:  ' + currentPlayer);

    const nextPlayerToShoot: number | undefined =
      status === 'shot' ? getUser(ws.id)?.index : getUser(enemy.id)?.index;
    console.log('nextPlayerToShoot is: ' + nextPlayerToShoot);
    if (
      // currentPlayer === getUser(ws.id)?.index &&
      // nextPlayerToShoot === getUser(ws.id)?.index
      true
    ) {
      // block shooting out of turn
      user.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: {
              x: x,
              y: y,
            },
            currentPlayer: getUser(ws.id)?.index, // getUser(ws.id)?.index,
            status: status,
          }),
          id: 0,
        }),
      );
    }

    user.send(
      JSON.stringify({
        type: 'turn',
        data: JSON.stringify({
          currentPlayer: nextPlayerToShoot,
        }),
        id: 0,
      }),
    );
  });
};

export const handleFinish = (ws: WebSocketWithId) => {
  ws.send(
    JSON.stringify({
      type: 'finish',
      data: JSON.stringify({
        winPlayer: ws.id,
      }),
      id: 0,
    }),
  );
};
