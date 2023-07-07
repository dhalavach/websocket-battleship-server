import { WebSocket, WebSocketServer } from 'ws';
import {
  checkIfHit,
  checkLoseConditions,
  usersWithShips,
  usersInGame,
} from './../models/gameModel.ts';
import { Ship, User } from '../types.ts';



export const setUserShips = (user: User, ships: Ship[]) => {
  usersWithShips.set(user.name, ships);
};



export const handleAddShips = (
  message: string,
  ws: WebSocket,
  websocketServer: WebSocketServer,
) => {
  const ships = JSON.parse(JSON.parse(message).data).ships;
  const gameId = JSON.parse(JSON.parse(message).data).gameId;
  const indexPlayer = parseInt(
    JSON.parse(JSON.parse(message).data).indexPlayer,
  );

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

  setUserShips(usersInGame[0], shipsWithHitCapacity);

  // mockShips = shipsWithHitCapacity;
  // users[indexPlayer].ships = mockShips;

  ws.send(
    JSON.stringify({
      type: 'start_game',
      data: JSON.stringify({
        ships: usersWithShips.get(usersInGame[0]),
        currentPlayerIndex: 1,
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
  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;
  const indexPlayer = parseInt(
    JSON.parse(JSON.parse(message).data).indexPlayer,
  );
  
  const opponent = usersInGame[0];
  ws.send(
    JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: {
          x: x,
          y: y,
        },
        currentPlayer: usersInGame[indexPlayer],
        status: checkIfHit(usersWithShips.get(opponent.name), x, y),
      }),
      id: 0,
    }),
  );

  ws.send(
    JSON.stringify({
      type: 'turn',
      data: JSON.stringify({
        currentPlayer: opponent,
      }),
      id: 0,
    }),
  );
  if (checkLoseConditions(usersWithShips.get(opponent.name))) {
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

export const handleFinish = ( ws: WebSocket) => {
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
