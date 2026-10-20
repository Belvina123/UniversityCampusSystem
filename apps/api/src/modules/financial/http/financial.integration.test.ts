import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createApp } from '../../../app.js';
import { prisma } from '../../../lib/prisma.js';
import * as financial from '../application/financialService.js';
import { createApiClient } from '@smart-campus/api-client';

const app = createApp();
const api = '/api/v1/financial';
const prefix = randomUUID();
let admin: string, finance: string, student: string, other: string, teacher: string;
let studentId: string, otherId: string;
let debtId: string, otherDebtId: string;
const bearer = (token: string) => `Bearer ${token}`;
const debtInput = (id = studentId) => ({ studentId: id, title: 'Propina integração', amount: 100, origin: 'TEST', dueDate: '2099-01-01T00:00:00.000Z' });
async function login(email: string, password: string) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  expect(res.body.data.user.fullName).toBeTruthy();
  expect(res.body.data.tokens.expiresIn).toBeTruthy();
  return res.body.data;
}
async function createDebt(id = studentId) {
  const res = await request(app).post(api + '/debts').set('Authorization', bearer(finance)).send(debtInput(id));
  expect(res.status).toBe(201);
  return res.body.data;
}
beforeAll(async () => {
  if (!process.env.DATABASE_URL || !new URL(process.env.DATABASE_URL).pathname.endsWith('_test')) throw Error('Executar apenas numa BD descartável _test.');
  admin = (await login('admin@smartcampus.demo', 'Admin123!')).tokens.accessToken;
  finance = (await login('financas@smartcampus.demo', 'Finance123!')).tokens.accessToken;
  teacher = (await login('docente@smartcampus.demo', 'Docente123!')).tokens.accessToken;
  const accounts = [];
  for (const suffix of ['a', 'b']) {
    const email = `${prefix}-${suffix}@example.test`;
    const res = await request(app).post('/api/v1/users').set('Authorization', bearer(admin)).send({ email, password: 'Student123!', fullName: `Estudante ${suffix}`, role: 'STUDENT' });
    expect(res.status).toBe(201);
    accounts.push(await login(email, 'Student123!'));
  }
  studentId = accounts[0].user.id; student = accounts[0].tokens.accessToken;
  otherId = accounts[1].user.id; other = accounts[1].tokens.accessToken;
  debtId = (await createDebt()).id; otherDebtId = (await createDebt(otherId)).id;
}, 60000);
afterAll(async () => { await prisma.$disconnect(); });

describe('Financeiro integrado no Core oficial', () => {
  it('token oficial usa sub, consulta /me e a dívida sem segundo login', async () => {
    expect(jwt.decode(student)).toMatchObject({ sub: studentId, role: 'STUDENT' });
    expect((await request(app).get('/api/v1/me').set('Authorization', bearer(student))).body.data.id).toBe(studentId);
    const res = await request(app).get(`${api}/debts/${debtId}`).set('Authorization', bearer(student));
    expect(res.status).toBe(200); expect(res.body.data.studentId).toBe(studentId);
    expect(res.body.meta.correlationId).toBeTruthy();
  });
  it.each(['missing', 'expired', 'altered'])('401: token %s', async kind => {
    let req = request(app).get(`${api}/debts/${debtId}`);
    if (kind !== 'missing') {
      const token = kind === 'expired' ? jwt.sign({ sub: studentId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: -1 }) : student.slice(0, -8) + 'tampered';
      req = req.set('Authorization', bearer(token));
    }
    expect((await req).status).toBe(401);
  });
  it('perfis permitidos consultam; TEACHER recebe 403', async () => {
    for (const token of [admin, finance, student]) expect((await request(app).get(api + '/debts').set('Authorization', bearer(token))).status).toBe(200);
    expect((await request(app).get(api + '/debts').set('Authorization', bearer(teacher))).status).toBe(403);
  });
  it.each(['detail', 'list', 'status', 'history', 'notifications'])('BOLA leitura: %s', async resource => {
    const paths: Record<string, string> = { detail: `/debts/${otherDebtId}`, list: `/debts?studentId=${otherId}`, status: `/students/${otherId}/status`, history: `/students/${otherId}/history`, notifications: `/students/${otherId}/notifications` };
    const res = await request(app).get(api + paths[resource]).set('Authorization', bearer(student));
    expect(res.status).toBe(403); expect(res.body.code).toBe('FORBIDDEN'); expect(res.body.details).toEqual([]);
    expect((await request(app).get(`${api}/debts/${otherDebtId}`).set('Authorization', bearer(other))).status).toBe(200);
  });
  it('BOLA escrita: estudante não contesta dívida alheia', async () => {
    const res = await request(app).post(api + '/analysis-requests').set('Authorization', bearer(student)).send({ debtId: otherDebtId, reason: 'Contestação de outro estudante' });
    expect(res.status).toBe(403);
    expect(await prisma.analysisRequest.count({ where: { debtId: otherDebtId } })).toBe(0);
  });
  it('404 e 400 conservam o envelope oficial e não viram 500', async () => {
    const res = await request(app).get(api + '/debts/missing').set('Authorization', bearer(finance));
    expect(res.status).toBe(404); expect(res.body).toMatchObject({ code: 'DEBT_NOT_FOUND', details: [], correlationId: expect.any(String) });
    expect((await request(app).post(api + '/debts').set('Authorization', bearer(finance)).send({ ...debtInput(), amount: -1 })).status).toBe(400);
    expect((await request(app).get(api + '/debts?limit=101').set('Authorization', bearer(finance))).status).toBe(400);
    expect((await request(app).get(api + '/students/missing/status').set('Authorization', bearer(finance))).status).toBe(404);
  });
  it('criar dívida escreve auditoria oficial com actorId e correlação', async () => {
    const res = await request(app).post(api + '/debts').set('Authorization', bearer(finance)).set('x-correlation-id', prefix).send(debtInput());
    expect(res.status).toBe(201);
    const audit = await prisma.auditEvent.findFirstOrThrow({ where: { resourceId: res.body.data.id, action: 'DEBT_CREATED' } });
    expect(audit.resource).toBe('financial'); expect(audit.actorId).toBe((jwt.decode(finance) as jwt.JwtPayload).sub); expect(audit.correlationId).toBe(prefix);
  });
  it('pagamento atómico, duplicado rejeitado e estudante proibido', async () => {
    const debt = await createDebt();
    const input = { debtId: debt.id, amountPaid: 100, paymentMethod: 'BANK_TRANSFER', referenceCode: randomUUID() };
    expect((await request(app).post(api + '/payments').set('Authorization', bearer(student)).send(input)).status).toBe(403);
    const results = await Promise.all([1, 2].map(() => request(app).post(api + '/payments').set('Authorization', bearer(finance)).send(input)));
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    expect(await prisma.payment.count({ where: { debtId: debt.id } })).toBe(1);
    expect((await prisma.debt.findUniqueOrThrow({ where: { id: debt.id } })).status).toBe('REGULARIZADA');
  });
  it('contestação própria, resolução FINANCE e rejeição de nova decisão', async () => {
    const debt = await createDebt();
    const created = await request(app).post(api + '/analysis-requests').set('Authorization', bearer(student)).send({ debtId: debt.id, reason: 'Solicito revisão da cobrança' });
    expect(created.status).toBe(201);
    const path = `${api}/analysis-requests/${created.body.data.id}`;
    const decision = { decision: 'PROCEDENTE', resolutionNotes: 'Comprovativo validado pela tesouraria' };
    expect((await request(app).patch(path).set('Authorization', bearer(student)).send(decision)).status).toBe(403);
    expect((await request(app).patch(path).set('Authorization', bearer(finance)).send(decision)).status).toBe(200);
    expect((await request(app).patch(path).set('Authorization', bearer(finance)).send(decision)).status).toBe(409);
  });
  it('política ADMIN, relatório FINANCE, consultas próprias e avisos pendentes', async () => {
    const policy = { gracePeriodDays: 5, autoBlockEnabled: true, maxDebtAmount: 0 };
    expect((await request(app).patch(api + '/policies/DEFAULT_POLICY').set('Authorization', bearer(finance)).send(policy)).status).toBe(403);
    expect((await request(app).patch(api + '/policies/DEFAULT_POLICY').set('Authorization', bearer(admin)).send(policy)).status).toBe(200);
    expect((await request(app).get(api + '/policies/DEFAULT_POLICY').set('Authorization', bearer(admin))).status).toBe(200);
    expect((await request(app).get(api + '/reports').set('Authorization', bearer(finance))).status).toBe(200);
    expect((await request(app).get(api + '/reports').set('Authorization', bearer(student))).status).toBe(403);
    for (const suffix of ['status', 'history', 'notifications']) expect((await request(app).get(`${api}/students/${studentId}/${suffix}`).set('Authorization', bearer(student))).status).toBe(200);
    const notification = await prisma.financialNotification.findFirstOrThrow({ where: { studentId } });
    expect((await request(app).get(`${api}/notifications/${notification.id}/delivery`).set('Authorization', bearer(finance))).status).toBe(200);
    expect((await request(app).post(`${api}/notifications/${notification.id}/retry`).set('Authorization', bearer(finance)).send({})).status).toBe(503);
  });
  it('falha da auditoria reverte a criação da dívida na mesma transacção', async () => {
    const before = await prisma.debt.count({ where: { studentId } });
    await expect(financial.createDebt(debtInput(), 'missing-actor', prefix)).rejects.toBeDefined();
    expect(await prisma.debt.count({ where: { studentId } })).toBe(before);
  });
  it('cliente oficial renova access token e repete consulta financeira', async () => {
    const session = await login(`${prefix}-a@example.test`, 'Student123!');
    let access = jwt.sign({ sub: studentId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: -1 });
    let refreshToken = session.tokens.refreshToken;
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const address = server.address() as { port: number };
      const client = createApiClient(`http://127.0.0.1:${address.port}/api/v1`, { getAccessToken: () => access, getRefreshToken: () => refreshToken, setTokens: (a, r) => { access = a; refreshToken = r; }, clear: () => { access = ''; refreshToken = ''; } });
      expect((await client.financialDebt(debtId)).data.studentId).toBe(studentId);
      expect((await client.me()).data.fullName).toBe('Estudante a');
      expect(refreshToken).not.toBe(session.tokens.refreshToken);
      expect((await client.logout()).data.ok).toBe(true);
    } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
  });
});
