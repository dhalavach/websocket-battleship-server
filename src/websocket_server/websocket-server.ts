// /*eslint-disable*/
// import { createWebSocketStream, WebSocket, WebSocketServer } from 'ws';
// import { IncomingMessage } from 'http';
// import { Duplex } from 'stream';

// import { config } from 'dotenv';
// config();
// const WS_PORT = Number(process.env.WS_PORT) || 5000;
// export const wss: WebSocketServer = new WebSocketServer({ port: WS_PORT });

// const interval: ReturnType<typeof setInterval> = setInterval(function ping() {
//   wss.clients.forEach((ws: any) => {
//     if (!ws.isAlive) return ws.terminate();

//     ws.isAlive = false;
//     ws.ping();
//   });
// }, 1000);

// const readDuplexStream = (duplexStream: Duplex) => {
//   return async () => {
//     for await (let chunk of duplexStream) {
//       // to do
//       console.log(chunk);
//     }
//   };
// };

// wss.on('connection', async (ws, req: IncomingMessage) => {
//   console.log(
//     `WS connection established! ${req.socket.remoteAddress}:${req.socket.remotePort}`,
//   );

//   const duplexStream = createWebSocketStream(ws, {
//     encoding: 'utf-8',
//     decodeStrings: false,
//   }).setMaxListeners(0);

//   ws.on('close', () => {
//     duplexStream.destroy();
//   });
//   //@ts-ignore
//   ws.isAlive = true;
//   ws.on('pong', () => {
//     //@ts-ignore
//     ws.isAlive = true;
//   });

//   duplexStream.on('readable', readDuplexStream(duplexStream));
// });

// wss.on('close', () => {
//   clearInterval(interval);
// });

// // wss.addEventListener('open', () => {
// //   wss.send('Hello Server!');
// // });

// // wss.addEventListener('message', (event) => {
// //   console.log('Message from server ', event.data);
// // });
