import { z } from 'zod';
import {
  isValidMozambiquePlate,
  MOZAMBIQUE_PLATE_MESSAGE,
  normalizeMozambiquePlate,
} from './mozambiquePlate.js';

export * from './mozambiquePlate.js';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password deve ter pelo menos 8 caracteres'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20, 'Refresh token inválido'),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  role: z.enum(['STUDENT', 'TEACHER', 'TECHNICIAN', 'COORDINATOR', 'ADMIN']),
});

export const createRoomSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  capacity: z.number().int().positive().max(1000),
  floor: z.number().int().min(-5).max(100).default(0),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  buildingId: z.string().min(1),
});

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  roomId: z.string().optional().nullable(),
  equipmentId: z.string().optional().nullable(),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  notes: z.string().max(1000).optional(),
  assigneeId: z.string().optional().nullable(),
});

const mozambiquePlateSchema = z
  .string()
  .min(8)
  .max(14)
  .transform(normalizeMozambiquePlate)
  .refine(isValidMozambiquePlate, { message: MOZAMBIQUE_PLATE_MESSAGE });

export const createPlateReadingSchema = z.object({
  lotId: z.string().min(1),
  plate: mozambiquePlateSchema,
  direction: z.enum(['IN', 'OUT']),
  sensorCode: z.string().min(2).max(64).default('CAM-LPR-SIM'),
  confidence: z.number().min(0).max(1).default(0.9),
  photoUrl: z.string().url().optional().nullable(),
  spotCode: z.string().min(2).max(16).optional().nullable(),
});

export const updateParkingSpotSchema = z.object({
  status: z.enum(['FREE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE']),
  plate: mozambiquePlateSchema.optional().nullable(),
});
export const createDeviceSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  type: z.string().min(2).max(60),
  status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN']).optional(),
  roomId: z.string().optional().nullable(),
  mqttTopic: z.string().max(200).optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>;
export type CreatePlateReadingInput = z.infer<typeof createPlateReadingSchema>;
export type UpdateParkingSpotInput = z.infer<typeof updateParkingSpotSchema>;
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;