import { httpServer } from './src/http_server/index.js';
import WebSocket, { WebSocketServer } from 'ws';
import {
  handleAddShips,
  handleAttack,
  handleFinish,
} from './src/controllers/gameController.ts';
import { WebSocketWithId } from './src/types.ts';
import { registerUser } from './src/controllers/userController.ts';
import {
  addUsersToRoom,
  createRoom,
} from './src/controllers/roomController.ts';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
console.log(`Start server on the ${PORT} port!`);
httpServer.listen(PORT);
console.log('start ws server');

export const websocketServer = new WebSocketServer({
  server: httpServer,
});

const interval: ReturnType<typeof setInterval> = setInterval(function ping() {
  websocketServer.clients.forEach((ws: any) => {
    if (!ws.isAlive) return ws.terminate();
    // ws.isAlive = false;
    ws.ping();
  });
}, 1000);

websocketServer.on('connection', (ws: WebSocketWithId) => {
  ws.isAlive = true;

  ws.on('error', console.error);

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

      case 'randomAttack':
        console.log('random attack handled');
        handleAttack(message, ws);
        break;

      case 'turn':
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
  clearInterval(interval);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
  httpServer.close();
  websocketServer.close();
  process.exit();
});
