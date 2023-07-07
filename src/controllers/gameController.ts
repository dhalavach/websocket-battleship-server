import { WebSocket, WebSocketServer } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  usersInGame,
} from './../models/gameModel.ts';
import { Ship, User } from '../types.ts';

// export const setUserShips = (user: User, ships: Ship[]) => {
//   usersWithShips.set(user.name, ships);
// };

export const handleAddShips = (message: string, ws: WebSocket) => {
  console.log('message on add ships: ' + message);
  const ships = JSON.parse(JSON.parse(message).data).ships;
  const gameId = JSON.parse(JSON.parse(message).data).gameId;
  const player = JSON.parse(JSON.parse(message).data).indexPlayer;
  // console.log('indexPlayer: ' + player.name);

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

  console.log('player namd before setting the ship: ' + player.name);

  usersWithShips.set(player.name, shipsWithHitCapacity);

  // mockShips = shipsWithHitCapacity;
  // users[indexPlayer].ships = mockShips;

  ws.send(
    JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: ships,
        // currentPlayerIndex: 0,
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

export const handleAttack = (message: string, ws: WebSocket) => {
  console.log('message on attack: ' + message);
  const player = JSON.parse(JSON.parse(message).data).indexPlayer;
  console.log('player name: ' + player.name);
  const opponent = usersInGame.filter((user) => user.name !== player.name)[0];
  console.log('opponent: name: ' + opponent.name);
  console.log(
    'asdf@email.com ships from users with ships map : ' +
      usersWithShips.get('asdf@email.com'),
  );
  console.log(
    'Logan ships from users with ships map : ' + usersWithShips.get('Logan'),
  );

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
          currentPlayer: player,
          status: checkIfHit(usersWithShips.get(player.name), x, y),
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
  if (checkLoseConditions(usersWithShips.get(player.name))) {
    ws.send(
      JSON.stringify({
        type: 'finish',
        data: JSON.stringify({
          winPlayer: 1,
        }),
        id: 0,
      }),
    );
  }
};

export const handleFinish = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      type: 'finish',
      data: JSON.stringify({
        winPlayer: 1,
      }),
      id: 0,
    }),
  );
};
