import { httpServer } from './src/http_server/index.js';
import { createWebSocketStream, WebSocket, WebSocketServer } from 'ws';
import { parseData } from './src/helpers.ts';
import { v4 as uuidv4 } from 'uuid';

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

websocketServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    console.log(JSON.parse(message));
    switch (JSON.parse(message).type) {
      case 'reg':
        //to do - validation
        const id = uuidv4();
        const data = JSON.parse(message).data; //json
        console.log(data);
        ws.send(
          JSON.stringify({
            type: 'reg',
            data: data,
            id: id,
          }),
        );
        users.set(JSON.parse(data).name, JSON.parse(data).password);
        console.log(users);
        break;
      
      
      case "create room":
        

      default:
        break;
    }
  });

  ws.on('data', async (chunk) => {
    const data = chunk.toString();
    const parsedData = await parseData(data);
    //console.log('received: %s', data);
    // const data = await parseCommand(command);
  });
});

process.on('SIGINT', () => {
  httpServer.close();
  websocketServer.close();
  process.exit();
});
