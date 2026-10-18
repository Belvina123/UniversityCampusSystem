import { Router } from 'express';
import { createDeviceSchema } from '@smart-campus/validation';
import { authenticate, authorize } from '../../../middleware/auth.js';
import * as deviceService from '../application/deviceService.js';
import { success } from '../../../middleware/errorHandler.js';
import { prisma } from '../../../lib/prisma.js';
import { notFound } from '../../../lib/errors.js';

export const devicesRouter = Router();

devicesRouter.get('/devices', authenticate, async (_req, res, next) => {
  try {
    const devices = await prisma.device.findMany({
      include: { sensors: true, room: { select: { id: true, code: true, name: true } } },
      orderBy: { code: 'asc' },
    });
    success(res, devices);
  } catch (err) {
    next(err);
  }
});

devicesRouter.post('/devices', authenticate, authorize('ADMIN', 'COORDINATOR', 'TECHNICIAN'), async (req, res, next) => {
  try {
    const body = createDeviceSchema.parse(req.body);
    const device = await deviceService.createDevice(body, req.user!.id, req.correlationId);
    success(res, device, 201);
  } catch (err) {
    next(err);
  }
});

devicesRouter.get('/sensors/:id/readings', authenticate, async (req, res, next) => {
  try {
    const sensor = await prisma.sensor.findUnique({ where: { id: req.params.id } });
    if (!sensor) throw notFound('SENSOR_NOT_FOUND', 'Sensor não encontrado');
    const readings = await prisma.reading.findMany({
      where: { sensorId: sensor.id },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
    success(res, readings.map((r) => ({ ...r, recordedAt: r.recordedAt.toISOString(), isDemo: r.isDemo })));
  } catch (err) {
    next(err);
  }
});

devicesRouter.get('/alerts', authenticate, async (_req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    success(
      res,
      alerts.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
});
