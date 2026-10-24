import { Router } from 'express';
import {
  batchCreateCourseWithSubjectsSchema, createCourseSchema,
  createDepartmentSchema, createSubjectSchema,
} from '@smart-campus/validation';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { success } from '../../../middleware/errorHandler.js';
import * as academic from '../application/academicService.js';

export const academicRouter = Router();
const WRITE = authorize('ADMIN', 'COORDINATOR');
const q = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

academicRouter.get('/departments', authenticate, async (_req, res, next) => {
  try { success(res, await academic.listDepartments()); } catch (e) { next(e); }
});
academicRouter.get('/departments/:id', authenticate, async (req, res, next) => {
  try { success(res, await academic.getDepartment(req.params.id)); } catch (e) { next(e); }
});
academicRouter.post('/departments', authenticate, WRITE, async (req, res, next) => {
  try {
    const body = createDepartmentSchema.parse(req.body);
    success(res, await academic.createDepartment(body, req.user!.id, req.correlationId), 201);
  } catch (e) { next(e); }
});
academicRouter.delete('/departments/:id', authenticate, WRITE, async (req, res, next) => {
  try {
    await academic.deleteDepartment(req.params.id, req.user!.id, req.correlationId);
    success(res, { ok: true });
  } catch (e) { next(e); }
});

academicRouter.get('/courses', authenticate, async (req, res, next) => {
  try { success(res, await academic.listCourses(q(req.query.departmentId))); } catch (e) { next(e); }
});
academicRouter.post('/courses', authenticate, WRITE, async (req, res, next) => {
  try {
    const body = createCourseSchema.parse(req.body);
    success(res, await academic.createCourse(body, req.user!.id, req.correlationId), 201);
  } catch (e) { next(e); }
});
academicRouter.post('/courses/batch-with-subjects', authenticate, WRITE, async (req, res, next) => {
  try {
    const body = batchCreateCourseWithSubjectsSchema.parse(req.body);
    success(res, await academic.createCourseWithSubjects(body, req.user!.id, req.correlationId), 201);
  } catch (e) { next(e); }
});
academicRouter.get('/courses/:courseId/subjects', authenticate, async (req, res, next) => {
  try { success(res, await academic.listSubjects(req.params.courseId)); } catch (e) { next(e); }
});

academicRouter.get('/subjects', authenticate, async (req, res, next) => {
  try { success(res, await academic.listSubjects(q(req.query.courseId))); } catch (e) { next(e); }
});
academicRouter.post('/subjects', authenticate, WRITE, async (req, res, next) => {
  try {
    const body = createSubjectSchema.parse(req.body);
    success(res, await academic.createSubject(body, req.user!.id, req.correlationId), 201);
  } catch (e) { next(e); }
});