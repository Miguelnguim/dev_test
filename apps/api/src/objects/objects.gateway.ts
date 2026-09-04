import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ObjectResponseDto } from './dto/object-response.dto.js';

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ObjectsGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(object: ObjectResponseDto) {
    this.server.emit('object.created', object);
  }

  emitUpdated(object: ObjectResponseDto) {
    this.server.emit('object.updated', object);
  }

  emitDeleted(id: string) {
    this.server.emit('object.deleted', { id });
  }
}
