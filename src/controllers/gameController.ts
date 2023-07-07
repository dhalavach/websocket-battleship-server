import { WebSocket, WebSocketServer } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  usersInGame,
} from './../models/gameModel.ts';
import { Ship, User, WebSocketWithId } from '../types.ts';
import { users } from '../models/userModel.ts';

// export const setUserShips = (user: User, ships: Ship[]) => {
//   usersWithShips.set(user.name, ships);
// };

export const handleAddShips = (message: string, ws: WebSocketWithId) => {
  console.log('message on add ships: ' + message);
  const ships = JSON.parse(JSON.parse(message).data).ships;
  const gameId = JSON.parse(JSON.parse(message).data).gameId;
  const player = JSON.parse(JSON.parse(message).data).indexPlayer;
  console.log('indexPlayer: ' + player);
  console.log('ws id: ' + ws.id);

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

  console.log('player name before setting the ships: ' + ws.id);

  usersWithShips.set(ws.id, shipsWithHitCapacity);

  // mockShips = shipsWithHitCapacity;
  // users[indexPlayer].ships = mockShips;

  ws.send(
    JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: ships,
        currentPlayerIndex: ws.id,
      }),
      id: 0,
    }),
  );

  // websocketServer.clients.forEach((client: WebSocket) => {
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(
  //       JSON.stringify({
  //         type: 'start_game',
  //         data: JSON.stringify({
  //           ships: mockShips,
  //           currentPlayerIndex: 1,
  //         }),
  //         id: 0,
  //       }),
  //     );
  //   }
  // });
};

export const handleAttack = (message: string, ws: WebSocketWithId) => {
  console.log('message on attack: ' + message);
  const player = JSON.parse(JSON.parse(message).data).indexPlayer;
  console.log('player name: ' + ws.id);
  console.log('users in game: ' + usersInGame.map((u) => u.name));
  const opponent = users.filter((user) => user.name !== ws.id)[0];
  if (opponent) console.log('opponent: ' + opponent.name);
  console.log(
    'player ships from users with ships map : ' + usersWithShips.get(ws.id),
  );
  // console.log(
  //   'opponent ships from users with ships map : ' +
  //     usersWithShips.get(opponent),
  // );

  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;
  try {
    ws.send(
      JSON.stringify({
        type: 'attack',
        data: JSON.stringify({
          position: {
            x: x,
            y: y,
          },
          currentPlayer: ws.id,
          status: checkIfHit(usersWithShips.get(opponent.name), x, y),
        }),
        id: 0,
      }),
    );
  } catch (err) {
    console.log(err);
  }

  // ws.send(
  //   JSON.stringify({
  //     type: 'turn',
  //     data: JSON.stringify({
  //       currentPlayer: opponent,
  //     }),
  //     id: 0,
  //   }),
  // );
  // if (checkLoseConditions(usersWithShips.get(player.name))) {
  //   ws.send(
  //     JSON.stringify({
  //       type: 'finish',
  //       data: JSON.stringify({
  //         winPlayer: 1,
  //       }),
  //       id: 0,
  //     }),
  //   );
  // }
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
