import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { User, WebSocketWithId } from '../types.ts';
import { validate, getUser, addUser } from '../models/userModel.ts';
import { users } from '../db/userDb.ts';

export const registerUser = (message: string, ws: WebSocketWithId) => {
  const name = JSON.parse(JSON.parse(message).data).name;
  const password = JSON.parse(JSON.parse(message).data).password;

  if (!getUser(name)) {
    addUser(name, password);
    ws.id = name;
    ws.send(
      JSON.stringify({
        type: 'reg',
        data: JSON.stringify({
          name: name,
          index: getUser(name)?.index,
          error: false,
          errorText: '',
        }),
      }),
    );
  } else {
    if (validate(name, password)) {
      ws.id = name;
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            name: name,
            index: getUser(name)?.index,
            error: false,
            errorText: '',
          }),
        }),
      );
    } else {
      ws.id = '';
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            name: '',
            id: '',
            error: true,
            errorText: 'Incorrect name or password!',
          }),
        }),
      );
    }
  }
  console.log(users);
};
