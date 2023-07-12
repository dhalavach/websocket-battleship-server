import { WebSocket } from 'ws';
import {
  gameData,
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  hitsOfShips,
} from './../models/gameModel.ts';
import { Hit, Ship, WebSocketWithId, userWinInfo } from '../types.ts';
import { users } from '../db/userDb.ts';
import { getUser, updateVictoryCount } from '../models/userModel.ts';
import { websocketServer } from '../index.ts';
import { rooms } from '../db/roomDb.ts';

export const handleAddShips = (message: string, ws: WebSocketWithId) => {
  const ships = JSON.parse(JSON.parse(message).data).ships;
  const gameId = JSON.parse(JSON.parse(message).data).gameId as number;
  const indexPlayer = JSON.parse(JSON.parse(message).data).indexPlayer;
  let counter: number | undefined = gameData.get(gameId)?.shipPlacementCounter;
  if (counter) counter++;
  else counter = 1;
  gameData.set(gameId, {
    shipPlacementCounter: counter,
    activePlayerIndex: 0,
  });

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
    if (gameData.get(gameId)?.shipPlacementCounter !== 2) {
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
        const data = gameData.get(gameId) || {
          shipPlacementCounter: 0,
          activePlayerIndex: 0,
        };
        if (data) data.activePlayerIndex = indexPlayer;
        gameData.set(gameId, data);
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
  const gameId = JSON.parse(JSON.parse(message).data).gameId;
  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;
  const playersInGame = rooms.get(gameId)?.users;
  const indexPlayer: number = JSON.parse(JSON.parse(message).data).indexPlayer;

  if (
    indexPlayer === gameData.get(gameId)?.activePlayerIndex ||
    ws.id === 'asdf@email.com'
  ) {
    playersInGame?.forEach((user) => {
      //const enemy = playersInGame?.[+!!!activePlayerIndex] as WebSocketWithId; //will work after shoot in turn only
      const enemy: WebSocketWithId = playersInGame.filter(
        (u) => u.id !== ws.id,
      )[0];
      console.log('enemy from handle attack: ' + enemy?.id);

      const indexPlayer: number = JSON.parse(
        JSON.parse(message).data,
      ).indexPlayer;
      const status: Hit | undefined = checkIfHit(
        enemy.id,
        usersWithShips.get(enemy.id) as Ship[],
        x,
        y,
      );
      const nextPlayerToShoot: number =
        status === 'shot' ? indexPlayer : (getUser(enemy.id)?.index as number); //activePlayerIndex : +!!!activePlayerIndex;

      gameData.set(gameId, {
        shipPlacementCounter: 2,
        activePlayerIndex: nextPlayerToShoot,
      });

      // activePlayerIndex = nextPlayerToShoot;

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
  const enemy = playersInGame?.filter((u) => u.id !== ws.id)[0];

  if (
    enemy?.readyState === WebSocket.CLOSED ||
    checkLoseConditions(usersWithShips.get(String(enemy?.id)))
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
    gameData.set(gameId, {
      shipPlacementCounter: 0,
      activePlayerIndex: 0,
    });
    rooms.clear(); //refactor

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
