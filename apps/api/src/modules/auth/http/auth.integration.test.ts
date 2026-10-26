import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { prisma } from '../../../lib/prisma.js';

const app = createApp();

describe('API auth e fluxo transversal', () => {
  let accessToken = '';
  let roomId = '';
  let incidentId = '';

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@smartcampus.demo' } });
    if (!admin) {
      throw new Error('Seed necessário antes dos testes (npm run db:seed)');
    }
  });

  it('health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('login falha com credenciais inválidas', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@smartcampus.demo',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.correlationId).toBeTruthy();
  });

  it('login com admin e obtém perfil', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@smartcampus.demo',
      password: 'Admin123!',
    });
    expect(login.status).toBe(200);
    accessToken = login.body.data.tokens.accessToken;

    const me = await request(app).get('/api/v1/me').set('Authorization', `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.role).toBe('ADMIN');
  });

  it('utilizador sem token não acede ao dashboard', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });

  it('consulta sala, cria ocorrência e altera estado', async () => {
    const rooms = await request(app).get('/api/v1/rooms').set('Authorization', `Bearer ${accessToken}`);
    expect(rooms.status).toBe(200);
    expect(rooms.body.data.length).toBeGreaterThan(0);
    roomId = rooms.body.data[0].id;

    const created = await request(app)
      .post('/api/v1/incidents')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Teste de ocorrência API',
        description: 'Criada pelo teste de integração',
        priority: 'HIGH',
        roomId,
      });
    expect(created.status).toBe(201);
    incidentId = created.body.data.id;

    const updated = await request(app)
      .patch(`/api/v1/incidents/${incidentId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'IN_PROGRESS', notes: 'Em tratamento no teste' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe('IN_PROGRESS');

    const audit = await request(app).get('/api/v1/audit-events?limit=10').set('Authorization', `Bearer ${accessToken}`);
    expect(audit.status).toBe(200);
    expect(audit.body.data.some((e: { action: string }) => e.action === 'INCIDENT_STATUS_UPDATE')).toBe(true);
  });

  it('estudante não pode gerir utilizadores', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'estudante@smartcampus.demo',
      password: 'Estudante123!',
    });
    const token = login.body.data.tokens.accessToken;
    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
