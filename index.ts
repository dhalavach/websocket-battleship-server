import { httpServer } from './src/http_server/index.js';
import { createWebSocketStream, WebSocket, WebSocketServer } from 'ws';
import { parseData, checkIfHit } from './src/helpers.ts';
import { v4 as uuidv4 } from 'uuid';
import { Ship } from './src/types.ts';

const HTTP_PORT = 3000;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log('start ws server');
const WS_PORT = 8080;

const websocketServer = new WebSocketServer({
  server: httpServer,
  // port: WS_PORT,
});

const users = new Map();
let mockId = 0;
let mockShips: Ship[];

websocketServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    console.log(JSON.parse(message));
    switch (JSON.parse(message).type) {
      case 'reg':
        //to do - validation
        //const id = uuidv4();
        const data = JSON.parse(message).data; //json
        console.log(data);
        ws.send(
          JSON.stringify({
            type: 'reg',
            data: data,
            id: mockId++,
            error: false,
            errorText: '',
          }),
        );
        users.set(JSON.parse(data).name, JSON.parse(data).password);
        console.log(users);
        break;

      case 'create_room':
        const roomUsersArr = [
          {
            name: 'asdf@email.com',
            index: 1,
          },
        ];
        const roomData = { roomId: 1, roomUsers: roomUsersArr };

        const roomsArr = [];
        roomsArr.push(roomData);
        const resp = JSON.stringify({
          type: 'update_room',
          data: JSON.stringify(roomsArr),
          id: 0,
        });
        console.log(resp);
        ws.send(resp);
        break;

      case 'add_user_to_room':
        const response = JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({
            idGame: 1,
            idPlayer: 1,
          }),
          id: 0,
        });
        console.log(response);
        ws.send(response);
        break;

      case 'add_ships':
        // console.log(JSON.parse(message));
        const ships = JSON.parse(JSON.parse(message).data).ships;
        console.log(ships);
        mockShips = ships;

        ws.send(
          JSON.stringify({
            type: 'start_game',
            data: JSON.stringify({
              ships: ships,
              currentPlayerIndex: 1,
            }),
            id: 0,
          }),
        );
        break;

      case 'attack':
        const x = JSON.parse(JSON.parse(message).data).x;
        console.log('x: ', x);
        const y = JSON.parse(JSON.parse(message).data).y;
        console.log('y: ', y);
        ws.send(
          JSON.stringify({
            type: 'attack',
            data: JSON.stringify({
              position: {
                x: x,
                y: y,
              },
              currentPlayer: 1,
              status: checkIfHit(mockShips, x, y),
            }),
            id: 0,
          }),
        );
        break;

      // case 'attack':
      //   ws.send(
      //     JSON.stringify({
      //       type: 'turn',
      //       data: JSON.stringify({
      //         currentPlayer: 2,
      //       }),
      //       id: 0,
      //     }),
      //   );

      case 'finish':
        ws.send(
          JSON.stringify({
            type: 'finish',
            data: JSON.stringify({
              winPlayer: 1,
            }),
            id: 0,
          }),
        );

      default:
        break;
    }
  });

  // ws.on('data', async (chunk) => {
  //   const data = chunk.toString();
  //   const parsedData = await parseData(data);
  //   //console.log('received: %s', data);
  //   // const data = await parseCommand(command);
  // });
});

process.on('SIGINT', () => {
  httpServer.close();
  websocketServer.close();
  process.exit();
});
