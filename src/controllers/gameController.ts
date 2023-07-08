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
        ws.send(
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

// roomUsersWsArr.forEach((user) =>
//   user.send(
//     JSON.stringify({
//       type: 'turn',
//       data: JSON.stringify({
//         currentPlayer: currentPlayer, // getUser(ws.id)?.index,
//       }),
//       id: 0,
//     }),
//   ),
// );

export const handleAttack = (message: string, ws: WebSocketWithId) => {
  console.log('message on attack:' + JSON.parse(message).data);
  const x = JSON.parse(JSON.parse(message).data).x;
  const y = JSON.parse(JSON.parse(message).data).y;

  roomUsersWsArr.forEach((user) => {
    const enemy = roomUsersWsArr.filter((u) => u.id !== user.id)[0];
    const status = checkIfHit(usersWithShips.get(enemy.id), x, y);
    user.send(
      //change back to user.send
      JSON.stringify({
        type: 'attack',
        data: JSON.stringify({
          position: {
            x: x,
            y: y,
          },
          currentPlayer: getUser(user.id)?.index, // getUser(ws.id)?.index,
          status: status,
        }),
        id: 0,
      }),
    );
    const nextPlayerToShoot: number | undefined =
      status === 'shot' ? getUser(user.id)?.index : getUser(enemy.id)?.index;
    console.log('nextPlayerToShoot is: ' + nextPlayerToShoot);
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

  // roomUsersWsArr.forEach((user) =>
  //   user.send(
  //     JSON.stringify({
  //       type: 'turn',
  //       data: JSON.stringify({
  //         currentPlayer: currentPlayer,
  //       }),
  //       id: 0,
  //     }),
  //   ),
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

// export const handleTurn = (ws: WebSocketWithId) => {
//   currentPlayer = getUser(roomUsersWsArr[1].id)?.index;
//   opponent = currentPlayer === 1 ? 2 : 1;
//   opponentName = roomUsersWsArr[opponent].id;
//   roomUsersWsArr.forEach((user) =>
//     user.send(
//       JSON.stringify({
//         type: 'turn',
//         data: JSON.stringify({
//           currentPlayer: currentPlayer,
//         }),
//         id: 0,
//       }),
//     ),
//   );
//   // const opponent = users.filter((user) => user.name !== ws.id)[0];
//   // console.log('player name from handleTurn: ' + ws.id);
//   // console.log('opp name from handleTurn: ' + opponent.name);
//   // roomUsersWsArr.forEach((user) =>
//   //   user.send(
//   //     JSON.stringify({
//   //       type: 'turn',
//   //       data: JSON.stringify({
//   //         currentPlayer: getUser(opponent.name)?.index,
//   //       }),
//   //       id: 0,
//   //     }),
//   //   ),
//   // );
// };

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
