import { Router } from 'express';
import { createRoomSchema } from '@smart-campus/validation';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { success } from '../../../middleware/errorHandler.js';
import * as roomService from '../application/roomService.js';

export const roomsRouter = Router();

roomsRouter.get('/rooms', authenticate, async (_req, res, next) => {
  try {
    success(res, await roomService.listRooms());
  } catch (err) {
    next(err);
  }
});

roomsRouter.get('/rooms/:id', authenticate, async (req, res, next) => {
  try {
    success(res, await roomService.getRoom(req.params.id));
  } catch (err) {
    next(err);
  }
});

roomsRouter.post('/rooms', authenticate, authorize('ADMIN', 'COORDINATOR', 'TECHNICIAN'), async (req, res, next) => {
  try {
    const body = createRoomSchema.parse(req.body);
    const room = await roomService.createRoom(body, req.user!.id, req.correlationId);
    success(res, room, 201);
  } catch (err) {
    next(err);
  }
});

