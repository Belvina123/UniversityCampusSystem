import type { CreateDeviceInput } from '@smart-campus/validation';

import { prisma } from '../../../lib/prisma.js';
import { audit } from '../../audit/application/auditService.js';
import { conflict, notFound } from '../../../lib/errors.js';

export async function createDevice(input: CreateDeviceInput, actorId: string, correlationId: string) {
  if (input.roomId) {
    const room = await prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room) throw notFound('ROOM_NOT_FOUND', 'Sala não encontrada');
  }
  const existing = await prisma.device.findUnique({ where: { code: input.code } });
  if (existing) throw conflict('DEVICE_CODE_TAKEN', 'Já existe um dispositivo com este código');
  
  const device = await prisma.device.create({
    data: {
      code: input.code,
      name: input.name,
      type: input.type,
      status: input.status ?? 'UNKNOWN',
      roomId: input.roomId ?? null,
      mqttTopic: input.mqttTopic ?? null,
    },
    include: { sensors: true, room: { select: { id: true, code: true, name: true } } },
  });

  await audit({
    action: 'DEVICE_CREATE',
    resource: 'Device',
    resourceId: device.id,
    actorId,
    correlationId,
    metadata: { code: device.code },
  });

  return device;
}