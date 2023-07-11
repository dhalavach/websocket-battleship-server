import { rooms } from '../db/roomDb.ts';
import { getUser } from '../models/userModel.ts';
import { WebSocketWithId } from './../types.ts';

export const handleSinglePlayMode = (message: string, ws: WebSocketWithId) => {
  console.log('handling single play mode');
  console.log(
    'data from message on single play mode: ' + JSON.parse(message).data,
  );

  ws.send(
    JSON.stringify({
      type: 'create_game',
      data: JSON.stringify({
        idGame: rooms.size + 1,
        idPlayer: getUser(ws.id)?.index,
      }),
      id: 0,
    }),
  );
};
