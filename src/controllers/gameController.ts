import { WebSocket } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  hitsOfShips,
} from './../models/gameModel.ts';
import { Ship, WebSocketWithId, userWinInfo } from '../types.ts';
import { users } from '../db/userDb.ts';
import { getUser, updateVictoryCount } from '../models/userModel.ts';
import { websocketServer } from '../../index.ts';
import { rooms } from '../db/roomDb.ts';

let shipPlacementCounter = 0;
let activePlayerIndex = 0;

export const handleAddShips = (message: string, ws: WebSocketWithId) => {
  shipPlacementCounter++;

  const ships = JSON.parse(JSON.parse(message).data).ships;
  const gameId = JSON.parse(JSON.parse(message).data).gameId;
  const indexPlayer = JSON.parse(JSON.parse(message).data).indexPlayer;

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
      const playersInGame = rooms.get(gameId)?.users;
      playersInGame?.forEach((user) => {
        user.send(
          JSON.stringify({
            type: 'start_game',
            data: JSON.stringify({
              ships: usersWithShips.get(user.id),
              currentPlayerIndex: indexPlayer,
            }),
            id: 0,
          }),
        );
        ws.send(
          JSON.stringify({
            type: 'turn',
            data: JSON.stringify({
              currentPlayer: indexPlayer,
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
  if (true) {
    const x = JSON.parse(JSON.parse(message).data).x;
    const y = JSON.parse(JSON.parse(message).data).y;
    const playersInGame = rooms.get(
      JSON.parse(JSON.parse(message).data).gameId,
    )?.users;

    if (true) {
      playersInGame?.forEach((user) => {
        //const enemy = playersInGame?.[+!!!activePlayerIndex] as WebSocketWithId; //will work after shoot in turn only
        const enemy = playersInGame.filter((u) => u.id !== ws.id)[0];

        const indexPlayer = JSON.parse(JSON.parse(message).data).indexPlayer;
        const status = checkIfHit(
          enemy?.id,
          usersWithShips.get(enemy?.id) as Ship[],
          x,
          y,
        );
        const nextPlayerToShoot: number =
          status === 'shot'
            ? (getUser(ws.id)?.index as number)
            : (getUser(enemy.id)?.index as number); //activePlayerIndex : +!!!activePlayerIndex;

        activePlayerIndex = nextPlayerToShoot;

        user.send(
          JSON.stringify({
            type: 'attack',
            data: JSON.stringify({
              position: {
                x: x,
                y: y,
              },
              currentPlayer: indexPlayer,
              status: status,
            }),
            id: 0,
          }),
        );

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
    }
    const enemy = playersInGame?.filter(
      (u) => u.id !== ws.id,
    )[0] as WebSocketWithId;

    if (
      enemy.readyState === WebSocket.CLOSED ||
      checkLoseConditions(usersWithShips.get(enemy.id))
    ) {
      updateVictoryCount(ws.id);

      playersInGame?.forEach((user) =>
        user.send(
          JSON.stringify({
            type: 'finish',
            data: JSON.stringify({
              winPlayer: getUser(ws.id)?.index,
            }),
            id: 0,
          }),
        ),
      );

      hitsOfShips.clear();
      usersWithShips.clear();
      shipPlacementCounter = 0;

      websocketServer.clients?.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          const tempUsersVictoriesArr: userWinInfo[] = [];
          users.forEach((user) =>
            tempUsersVictoriesArr.push({
              name: user.name,
              wins: user.victories,
            }),
          );
          client.send(
            JSON.stringify({
              type: 'update_winners',
              data: JSON.stringify(tempUsersVictoriesArr),
              id: 0,
            }),
          );
        }
      });
    }
  }
};

export const handleFinish = (ws: WebSocketWithId) => {
  ws.send(
    JSON.stringify({
      type: 'finish',
      data: JSON.stringify({
        winPlayer: getUser(ws.id)?.index,
      }),
      id: 0,
    }),
  );
};
