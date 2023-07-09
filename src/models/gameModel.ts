import { User, Hit, Ship } from './../types.ts';
import { users } from '../db/userDb.ts';
export let activeUserName: string;
// export const usersInGame: User[] = [];
const hitsOfShips = new Set();
export const usersWithShips: Map<string, Ship[]> = new Map();

export const checkIfHit = (ships: Ship[], x: number, y: number): Hit => {
  function check(ship: Ship) {
    const lengthX = ship.direction === false ? ship.length - 1 : 0;
    const lengthY = ship.direction === true ? ship.length - 1 : 0;
    if (
      x >= ship.position.x &&
      x <= ship.position.x + lengthX &&
      y >= ship.position.y &&
      y <= ship.position.y + lengthY
    ) {
      if (!hitsOfShips.has(`${x}*${y}`) && ship.hitCapacity) ship.hitCapacity--;
      hitsOfShips.add(`${x}*${y}`);
      return true;
    } else {
      return false;
    }
  }

  return ships.some(check) ? 'shot' : 'miss';
};

export const checkLoseConditions = (
  shipsWithHitCapacity: Ship[] | undefined,
) => {
  if (!shipsWithHitCapacity) return null;
  return shipsWithHitCapacity.every((ship) => ship.hitCapacity === 0);
};
