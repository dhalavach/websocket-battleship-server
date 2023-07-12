import { WebSocketWithId } from './types.ts';

export const waitForOpenConnection = async (socket: WebSocketWithId) => {
  return new Promise<void>((resolve, reject) => {
    const maxNumberOfAttempts = 5;
    const intervalTime = 200; //ms

    let currentAttempt = 0;
    const interval = setInterval(() => {
      if (currentAttempt > maxNumberOfAttempts - 1) {
        clearInterval(interval);
        reject(new Error('Maximum number of attempts exceeded'));
      } else if (socket.readyState === socket.OPEN) {
        clearInterval(interval);
        resolve();
      }
      currentAttempt++;
    }, intervalTime);
  });
};

export const sendMessage = async (socket: WebSocketWithId, message: string) => {
  if (socket.readyState !== socket.OPEN) {
    try {
      await waitForOpenConnection(socket);
      socket.send(message);
    } catch (err) {
      console.error(err);
    }
  } else {
    socket.send(message);
  }
};
