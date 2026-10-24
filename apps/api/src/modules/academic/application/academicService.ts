import { Prisma } from '@prisma/client';
import type {
  BatchCreateCourseWithSubjectsInput, CreateCourseInput,
  CreateDepartmentInput, CreateSubjectInput,
} from '@smart-campus/validation';
import { AppError, conflict, notFound } from '../../../lib/errors.js';
import { prisma } from '../../../lib/prisma.js';
import { audit } from '../../audit/application/auditService.js';

const ref = { select: { id: true, code: true, name: true } } as const;
const withDates = <T extends { createdAt: Date; updatedAt: Date }>(r: T) => ({
  ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
});
const isDuplicate = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

// ---- Departamentos ----
export async function listDepartments() {
  return (await prisma.department.findMany({ orderBy: { code: 'asc' } })).map(withDates);
}
export async function getDepartment(id: string) {
  const row = await prisma.department.findUnique({ where: { id } });
  if (!row) throw notFound('DEPARTMENT_NOT_FOUND', 'Departamento não encontrado');
  return withDates(row);
}
export async function createDepartment(input: CreateDepartmentInput, actorId: string, correlationId: string) {
  try {
    const row = await prisma.department.create({ data: input });
    await audit({ action: 'DEPARTMENT_CREATE', resource: 'Department', resourceId: row.id, actorId, correlationId, metadata: { code: row.code } });
    return withDates(row);
  } catch (e) {
    if (isDuplicate(e)) throw conflict('DEPARTMENT_CODE_EXISTS', `Já existe um departamento com o código '${input.code}'`);
    throw e;
  }
}
export async function deleteDepartment(id: string, actorId: string, correlationId: string) {
  await getDepartment(id);
  const [courses, teachers] = await Promise.all([
    prisma.course.count({ where: { departmentId: id } }),
    prisma.teacherProfile.count({ where: { departmentId: id } }),
  ]);
  if (courses > 0 || teachers > 0) {
    throw new AppError('BUSINESS_RULE_VIOLATION',
      `Não é possível eliminar: ${courses} curso(s) e ${teachers} docente(s) associados.`, 400);
  }
  await prisma.department.delete({ where: { id } });
  await audit({ action: 'DEPARTMENT_DELETE', resource: 'Department', resourceId: id, actorId, correlationId });
}

// ---- Cursos ----
export async function listCourses(departmentId?: string) {
  const rows = await prisma.course.findMany({
    where: departmentId ? { departmentId } : undefined,
    include: { department: ref }, orderBy: { code: 'asc' },
  });
  return rows.map(withDates);
}
export async function createCourse(input: CreateCourseInput, actorId: string, correlationId: string) {
  if (!(await prisma.department.findUnique({ where: { id: input.departmentId } })))
    throw notFound('DEPARTMENT_NOT_FOUND', 'Departamento associado não encontrado');
  try {
    const row = await prisma.course.create({ data: input, include: { department: ref } });
    await audit({ action: 'COURSE_CREATE', resource: 'Course', resourceId: row.id, actorId, correlationId, metadata: { code: row.code } });
    return withDates(row);
  } catch (e) {
    if (isDuplicate(e)) throw conflict('COURSE_CODE_EXISTS', `Já existe um curso com o código '${input.code}'`);
    throw e;
  }
}

// ---- Disciplinas ----
export async function listSubjects(courseId?: string) {
  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw notFound('COURSE_NOT_FOUND', 'Curso associado não encontrado');
  }

  const rows = await prisma.subject.findMany({
    where: courseId ? { courseId } : undefined,
    include: { course: ref }, orderBy: { code: 'asc' },
  });
  return rows.map(withDates);
}
export async function createSubject(input: CreateSubjectInput, actorId: string, correlationId: string) {
  if (!(await prisma.course.findUnique({ where: { id: input.courseId } })))
    throw notFound('COURSE_NOT_FOUND', 'Curso associado não encontrado');
  try {
    const row = await prisma.subject.create({ data: input, include: { course: ref } });
    await audit({ action: 'SUBJECT_CREATE', resource: 'Subject', resourceId: row.id, actorId, correlationId, metadata: { code: row.code } });
    return withDates(row);
  } catch (e) {
    if (isDuplicate(e)) throw conflict('SUBJECT_CODE_EXISTS', `Já existe uma disciplina com o código '${input.code}'`);
    throw e;
  }
}

// ---- Transação atómica (substitui a simulação em memória) ----
export async function createCourseWithSubjects(input: BatchCreateCourseWithSubjectsInput, actorId: string, correlationId: string) {
  if (!(await prisma.department.findUnique({ where: { id: input.course.departmentId } })))
    throw notFound('DEPARTMENT_NOT_FOUND', 'Departamento associado não encontrado');
  try {
    const out = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({ data: input.course, include: { department: ref } });
      const subjects = [];
      for (const s of input.subjects) {
        subjects.push(await tx.subject.create({ data: { ...s, courseId: course.id }, include: { course: ref } }));
      }
      return { course, subjects };
    });
    await audit({ action: 'COURSE_BATCH_CREATE', resource: 'Course', resourceId: out.course.id, actorId, correlationId, metadata: { subjects: out.subjects.length } });
    return { course: withDates(out.course), subjects: out.subjects.map(withDates) };
  } catch (e) {
    if (isDuplicate(e)) throw conflict('DUPLICATE_CODE', 'Código duplicado: nada foi gravado (rollback).');
    throw e;
  }
}