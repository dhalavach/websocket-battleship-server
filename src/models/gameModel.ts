import { Hit, Ship, GameParameters } from './../types.ts';
export const gameData: Map<number, GameParameters> = new Map();
export const hitsOfShips: Map<string, Set<string>> = new Map();
export const usersWithShips: Map<string, Ship[]> = new Map();

export const checkIfHit = (
  user: string,
  ships: Ship[],
  x: number,
  y: number,
): Hit | undefined => {
  function check(ship: Ship) {
    const lengthX = ship.direction === false ? ship.length - 1 : 0;
    const lengthY = ship.direction === true ? ship.length - 1 : 0;
    if (
      x >= ship.position.x &&
      x <= ship.position.x + lengthX &&
      y >= ship.position.y &&
      y <= ship.position.y + lengthY
    ) {
      if (!hitsOfShips?.get(user)?.has(`${x}*${y}`) && ship.hitCapacity)
        ship.hitCapacity--;
      const oldHits = hitsOfShips.get(user);
      const newHits = oldHits?.add(`${x}*${y}`);
      hitsOfShips.set(user, newHits as Set<string>);
      return true;
    } else {
      return false;
    }
  }

  if (ships) return ships.some(check) ? 'shot' : 'miss';
};

export const checkLoseConditions = (
  shipsWithHitCapacity: Ship[] | undefined,
) => {
  if (!shipsWithHitCapacity) return null;
  return shipsWithHitCapacity.every((ship) => ship.hitCapacity === 0);
};
