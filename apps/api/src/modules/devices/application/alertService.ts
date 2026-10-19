import { notFound } from '../../../lib/errors.js';
import { prisma } from '../../../lib/prisma.js';
import { audit } from '../../audit/application/auditService.js';

export async function acknowledgeAlert(id: string, actorId: string, correlationId: string) {
  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing) throw notFound('ALERT_NOT_FOUND', 'Alerta não encontrado');

  const alert = existing.acknowledged
    ? existing
    : await prisma.alert.update({ where: { id }, data: { acknowledged: true } });

  if (!existing.acknowledged) {
    await audit({
      action: 'ALERT_ACK',
      resource: 'Alert',
      resourceId: alert.id,
      actorId,
      correlationId,
      metadata: { severity: alert.severity },
    });
  }

  return {
    ...alert,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
  };
}