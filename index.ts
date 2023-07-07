import { httpServer } from './src/http_server/index.js';
import { createWebSocketStream, WebSocket, WebSocketServer } from 'ws';
import { parseData } from './src/helpers.ts';
import {
  handleAddShips,
  handleAttack,
  handleFinish,
} from './src/controllers/gameController.ts';
import { v4 as uuidv4 } from 'uuid';
import { Ship, User, WebSocketWithId } from './src/types.ts';
import { registerUser } from './src/controllers/userController.ts';
import { usersInGame } from './src/models/gameModel.ts';
import {
  addUsersToRoom,
  createRoom,
} from './src/controllers/roomController.ts';

const HTTP_PORT = 3000;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log('start ws server');
const WS_PORT = 8080;

export const websocketServer = new WebSocketServer({
  server: httpServer,
});

websocketServer.on('connection', (ws: WebSocketWithId) => {
  console.log(
    'number of websocket server clients: ' + websocketServer.clients.size,
  );

  ws.on('message', (message: string) => {
    switch (JSON.parse(message).type) {
      case 'reg':
        registerUser(message, ws);
        break;

      case 'create_room':
        createRoom(message, ws);
        break;

      case 'add_user_to_room':
        addUsersToRoom(message, ws);
        break;

      case 'add_ships':
        handleAddShips(message, ws);
        break;

      case 'attack':
        handleAttack(message, ws);
        break;

      case 'finish':
        handleFinish(ws);
        break;

      default:
        ws.send(JSON.stringify({ error: true, errorText: 'Invalid request!' }));
        break;
    }
  });
});

process.on('SIGINT', () => {
  httpServer.close();
  websocketServer.close();
  process.exit();
});
