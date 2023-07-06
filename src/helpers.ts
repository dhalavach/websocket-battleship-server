import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { User, Hit, Ship } from './types.ts';
import { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const writeToFile = async (path: string, data: any) => {
  await writeFile(path, JSON.stringify(data), {
    encoding: 'utf8',
    flag: 'a+',
  });
};

// export const registerUser = (userInfo: User) => {

// };

export const parseData = async (message: string): Promise<string | void> => {
  try {
    const messageObject = await JSON.parse(message);

    switch (messageObject.type) {
      case 'reg':
        {
          const name = JSON.parse(messageObject.data).name;
          const id = JSON.parse(messageObject.id);
          const password = JSON.parse(messageObject.data).password;
          const user = { id, name, password };

          writeToFile(resolve(__dirname, 'mock-data', 'users.json'), user);
        }

        break;

      default:
        break;
    }
  } catch (err) {
    console.log(err);
  }
};

export const checkIfHit = (ships: Ship[], x: number, y: number): Hit => {
  function check(ship: Ship) {
    const lengthX = ship.direction === false ? ship.length - 1 : 0;
    const lengthY = ship.direction === true ? ship.length - 1 : 0;
    return (
      x >= ship.position.x &&
      x <= ship.position.x + lengthX &&
      y >= ship.position.y &&
      y <= ship.position.y + lengthY
    );
  }
  return ships.some(check) ? 'shot' : 'miss';
};
