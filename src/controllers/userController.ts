import WebSocket from 'ws';

import { v4 as uuidv4 } from 'uuid';
import { User, WebSocketWithId } from '../types.ts';
import { users, validate, getUser, addUser } from '../models/userModel.ts';

export const registerUser = (message: string, ws: WebSocketWithId) => {
  const data = JSON.parse(message).data;
  console.log('data on reg: ' + data);
  const name = JSON.parse(JSON.parse(message).data).name;
  console.log(name);
  const password = JSON.parse(JSON.parse(message).data).password;
  console.log(password);
  if (!getUser(name, users)) {
    addUser(name, password, users);
    ws.id = name;
    ws.send(
      JSON.stringify({
        type: 'reg',
        data: JSON.stringify({
          name: name,
          index: users.length + 1,
          error: false,
          errorText: '',
        }),
      }),
    );
  } else {
    if (validate(name, password, users)) {
      ws.id = name;
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            name: name,
            index: users.length + 1,
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
