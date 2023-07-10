import { WebSocket, WebSocketServer } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  hitsOfShips
} from './../models/gameModel.ts';
import { Ship, User, WebSocketWithId } from '../types.ts';
import { users } from '../db/userDb.ts';
import { getUser, updateVictoryCount } from '../models/userModel.ts';
import { websocketServer } from '../../index.ts';
import { rooms } from '../db/roomDb.ts';
import { clearRoom } from '../models/roomModel.ts';
import { getListOfRooms } from './roomController.ts';

let shipPlacementCounter = 0;

export const handleAddShips = (message: string, ws: WebSocketWithId) => {
  console.log(ws.id);
  console.log('message on add ships: ' + JSON.parse(message).data);

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
    if (shipPlacementCounter < 2) {
      setTimeout(checkFlag, 1000);
    } else {
      const playersInGame = rooms.get(rooms.size)?.users; // refactor use room id from the message
      playersInGame?.forEach((user) => {
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
  console.log(
    'gameId from message on attack:' +
      JSON.parse(JSON.parse(message).data).gameId,
  );
  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;
  const playersInGame = rooms.get(
    JSON.parse(JSON.parse(message).data).gameId,
  )?.users;
  console.log('players in game: ' + playersInGame?.map((p) => p.id));

  playersInGame?.forEach((user) => {
    const enemy = playersInGame.filter((u) => u.id !== ws.id)[0];
    const status = checkIfHit(enemy.id, usersWithShips.get(enemy?.id) as Ship[], x, y);
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
  const enemy = playersInGame?.filter((u) => u.id !== ws.id)[0];
  console.log('enemy id: ' + enemy?.id);
  console.log(
    'userwithships enemy before checking lose conditions: ' +
      usersWithShips.get(enemy?.id as string)?.map((ship) => ship.hitCapacity),
  );
  if (checkLoseConditions(usersWithShips.get(enemy?.id as string))) {
    usersWithShips.clear();
    hitsOfShips.clear();
    updateVictoryCount(ws.id);
    // usersWithShips.clear(); // added to let 2nd game finish ?
    // clearRoom();

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

    websocketServer.clients?.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        const tempUsersVictoriesArr: any[] = [];
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

    //refactor and fix
    // usersWithShips.clear();
    // clearRoom();
    //getListOfRooms(ws);
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
