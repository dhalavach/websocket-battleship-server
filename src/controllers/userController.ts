import { WebSocketWithId } from '../types.ts';
import { validate, getUser, addUser } from '../models/userModel.ts';
import { getListOfRooms } from '../controllers/roomController.ts';

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
    getListOfRooms(ws);
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
      getListOfRooms(ws);
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
};
