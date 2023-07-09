import { User } from '../types.ts';
import { users } from '../db/userDb.ts';

// export const playerIndices = new Map();
// users.map((user, index) => playerIndices.set(user.name, index));

export const validate = (name: string, password: string): boolean => {
  const user = users.find((user) => user.name === name);
  if (user && user.password === password) return true;
  return false;
};

export const addUser = (name: string, password: string): User | null => {
  if (users.find((user) => user.name === name)) return null;
  const user: User = {
    index: users.length + 1,
    name,
    password,
    victories: 0,
  };
  users.push(user);
  return user;
};

export const getUser = (name: string): User | undefined => {
  return users.find((user) => user.name === name);
};

export const updateVictoryCount = (name: string): void => {
  const winnerIndex: number = users.findIndex((user) => user.name === name);
  users[winnerIndex].victories++;
};
