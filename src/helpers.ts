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
