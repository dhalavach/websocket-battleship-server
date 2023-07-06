export class User {
  name: string;
  password: string;
  victories: number;
  ships?: [];

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
    this.victories = 0;
  }
}

export class Database {
  users: User[];

  constructor() {
    this.users = [];
  }

  addUser(name: string, password: string) {
    if (this.users.find((user) => user.name === name)) return;
    const user = new User(name, password);
    this.users.push(user);
    return user;
  }

  getUser(name: string) {
    return this.users.find((user) => user.name === name);
  }

  validate(name: string, password: string): boolean {
    const user = this.users.find((user) => user.name === name);
    if (user && user.password === password) return true;
    return false;
  }
}

export const validate = (name: string, password: string, users: User[]) => {
  const user = users.find((user) => user.name === name);
  if (user && user.password === password) return true;
  return false;
};

export const addUser = (name: string, password: string, users: User[]) => {
  const user = new User(name, password);
  users.push(user);
  return user;
};

export const getUser = (name: string, users: User[]) => {
  return users.find((user) => user.name === name);
};
