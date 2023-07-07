import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types.ts';
import { users, validate, getUser, addUser } from '../models/userModel.ts';

export const registerUser = (message: string, ws: WebSocket) => {
  const data = JSON.parse(message).data;
  const name = JSON.parse(JSON.parse(message).data).name;
  const password = JSON.parse(JSON.parse(message).data).password;
  if (!getUser(name, users)) {
    addUser(name, password, users);
    ws.send(
      JSON.stringify({
        type: 'reg',
        data: data,
        id: name,
        error: false,
        errorText: '',
      }),
    );
  } else {
    if (validate(name, password, users)) {
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: data,
          id: name,
          error: false,
          errorText: '',
        }),
      );
    } else {
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: '',
          id: '',
          error: true,
          errorText: 'Incorrect name or password!',
        }),
      );
    }
  }
  console.log(users);
};
