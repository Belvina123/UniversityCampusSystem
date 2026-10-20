export type RoleCode =
  | 'STUDENT'
  | 'TEACHER'
  | 'TECHNICIAN'
  | 'COORDINATOR'
  | 'ADMIN'
  | 'FINANCE';

export type ModuleStatus = 'available' | 'partial' | 'development';

export type CampusModule = {
  key: string;
  label: string;
  path: string;
  description: string;
  status: ModuleStatus;
  requiredRoles?: RoleCode[];
  groupHint?: string;
};

export type ApiSuccess<T> = {
  data: T;
  meta: {
    correlationId: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
};

export type ApiError = {
  code: string;
  message: string;
  details: unknown[];
  correlationId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  isActive: boolean;
};

export type LoginResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RoomDto = {
  id: string;
  code: string;
  name: string;
  capacity: number;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  building: { id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type IncidentDto = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  roomId: string | null;
  reporterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  currentUser: AuthUser;
  coreStatus: 'healthy' | 'degraded';
  roomsCount: number;
  openIncidents: number;
  devicesCount: number;
  recentAlerts: Array<{ id: string; title: string; severity: string; createdAt: string; isDemo: boolean }>;
  modulesAvailable: number;
  modulesInDevelopment: number;
  recentActivity: Array<{ id: string; action: string; resource: string; createdAt: string }>;
};

export type ParkingSpotStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';

export type ParkingSpotDto = {
  id: string;
  code: string;
  rowLabel: string;
  level: number;
  status: ParkingSpotStatus;
  plate: string | null;
  updatedAt: string;
};

export type ParkingLotOverview = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  capacity: number;
  free: number;
  occupied: number;
  reserved: number;
  outOfService: number;
  occupancyPercent: number;
  readingsCount: number;
  spots: ParkingSpotDto[];
};

export type PlateReadingDto = {
  id: string;
  plate: string;
  direction: 'IN' | 'OUT';
  confidence: number;
  photoUrl: string | null;
  sensorCode: string;
  isDemo: boolean;
  lot: { id: string; code: string; name: string };
  spot: { id: string; code: string } | null;
  recordedAt: string;
};

export const campusModules: CampusModule[] = [
  {
    key: 'ops',
    label: 'Operações',
    path: '/ops',
    description: 'Centro de operações com mapa, métricas ambientais e padrões do campus.',
    status: 'available',
  },
  {
    key: 'financial',
    label: 'Gestão financeira',
    path: '/financial',
    description: 'Dívidas, pagamentos e contestações de estudantes.',
    status: 'partial',
    requiredRoles: ['STUDENT', 'FINANCE', 'ADMIN'],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Visão geral do campus e indicadores operacionais.',
    status: 'available',
  },
  {
    key: 'users',
    label: 'Utilizadores e perfis',
    path: '/users',
    description: 'Gestão de utilizadores, roles e perfis.',
    status: 'available',
    requiredRoles: ['ADMIN', 'COORDINATOR'],
  },
  {
    key: 'academic',
    label: 'Gestão académica',
    path: '/academic',
    description: 'Hub académico: departamentos, cursos e planos.',
    status: 'partial',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'departments',
    label: 'Departamentos',
    path: '/departments',
    description: 'Estrutura departamental da universidade.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'courses',
    label: 'Cursos',
    path: '/courses',
    description: 'Catálogo de cursos e programas.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'subjects',
    label: 'Disciplinas',
    path: '/subjects',
    description: 'Disciplinas e planos curriculares.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'students',
    label: 'Estudantes',
    path: '/students',
    description: 'Dados académicos de estudantes.',
    status: 'partial',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'teachers',
    label: 'Docentes',
    path: '/teachers',
    description: 'Perfil e afectação de docentes.',
    status: 'partial',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'enrolments',
    label: 'Matrículas',
    path: '/enrolments',
    description: 'Matrículas e inscrições.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'assessments',
    label: 'Avaliações e notas',
    path: '/assessments',
    description: 'Avaliações, notas e actas.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'schedules',
    label: 'Horários e assiduidade',
    path: '/schedules',
    description: 'Horários lectivos e registo de presença.',
    status: 'development',
    groupHint: 'Grupo Académico',
  },
  {
    key: 'campus',
    label: 'Campus físico',
    path: '/campus',
    description: 'Edifícios, salas e espaços do campus.',
    status: 'partial',
    groupHint: 'Grupo Infraestrutura',
  },
  {
    key: 'buildings',
    label: 'Edifícios',
    path: '/buildings',
    description: 'Cadastro de edifícios.',
    status: 'partial',
    groupHint: 'Grupo Infraestrutura',
  },
  {
    key: 'rooms',
    label: 'Salas',
    path: '/rooms',
    description: 'Salas e disponibilidade.',
    status: 'available',
    groupHint: 'Grupo Infraestrutura',
  },
  {
    key: 'laboratories',
    label: 'Laboratórios',
    path: '/laboratories',
    description: 'Laboratórios e espaços técnicos.',
    status: 'development',
    groupHint: 'Grupo Infraestrutura',
  },
  {
    key: 'equipment',
    label: 'Equipamentos',
    path: '/equipment',
    description: 'Inventário de equipamentos.',
    status: 'development',
    groupHint: 'Grupo Infraestrutura',
  },
  {
    key: 'incidents',
    label: 'Ocorrências',
    path: '/incidents',
    description: 'Pedidos e tratamento de ocorrências.',
    status: 'available',
    groupHint: 'Grupo Manutenção',
  },
  {
    key: 'maintenance',
    label: 'Manutenção',
    path: '/maintenance',
    description: 'Acções de manutenção associadas a ocorrências.',
    status: 'partial',
    groupHint: 'Grupo Manutenção',
  },
  {
    key: 'iot',
    label: 'IoT',
    path: '/iot',
    description: 'Dispositivos e leituras do campus inteligente.',
    status: 'partial',
    groupHint: 'Grupo IoT',
  },
  {
    key: 'parking',
    label: 'Estacionamento',
    path: '/parking',
    description: 'Parque de viaturas, vagas e leitura de matrículas.',
    status: 'available',
    groupHint: 'Grupo Infraestrutura / IoT',
  },
  {
    key: 'devices',
    label: 'Dispositivos',
    path: '/devices',
    description: 'Registo de dispositivos IoT.',
    status: 'partial',
    groupHint: 'Grupo IoT',
  },
  {
    key: 'sensors',
    label: 'Sensores',
    path: '/sensors',
    description: 'Sensores associados a dispositivos.',
    status: 'development',
    groupHint: 'Grupo IoT',
  },
  {
    key: 'readings',
    label: 'Leituras',
    path: '/readings',
    description: 'Leituras de sensores (MQTT futuro).',
    status: 'development',
    groupHint: 'Grupo IoT',
  },
  {
    key: 'alerts',
    label: 'Alertas',
    path: '/alerts',
    description: 'Alertas operacionais e de sensores.',
    status: 'partial',
    groupHint: 'Grupo IoT',
  },
  {
    key: 'notifications',
    label: 'Notificações',
    path: '/notifications',
    description: 'Centro de notificações do utilizador.',
    status: 'development',
    groupHint: 'Grupo Core',
  },
  {
    key: 'reports',
    label: 'Relatórios',
    path: '/reports',
    description: 'Indicadores e relatórios agregados.',
    status: 'development',
    groupHint: 'Grupo Relatórios',
  },
  {
    key: 'audit',
    label: 'Auditoria',
    path: '/audit',
    description: 'Eventos de auditoria do sistema.',
    status: 'available',
    requiredRoles: ['ADMIN', 'COORDINATOR'],
  },
  {
    key: 'admin',
    label: 'Administração',
    path: '/admin',
    description: 'Administração do sistema e configuração.',
    status: 'partial',
    requiredRoles: ['ADMIN'],
  },
];

export type DebtStatus = "PENDENTE" | "VENCIDA" | "REGULARIZADA" | "CANCELADA";
export type FinancialStatusType = "ACTIVE" | "BLOCKED";
export type AnalysisRequestStatus =
  | "PENDENTE_ANALISE"
  | "PROCEDENTE"
  | "IMPROCEDENTE";
export type PaymentMethod =
  | "BANK_TRANSFER"
  | "CASH_DEPOSIT"
  | "MOBILE_MONEY"
  | "POS";

// DTO de Divida
export interface DebtDto {
  id: string;
  code: string;
  studentId: string;
  title: string;
  description?: string;
  amount: number;
  origin: string;
  dueDate: string;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

// DTO de Pagamento
export interface PaymentDto {
  id: string;
  code: string;
  debtId: string;
  studentId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceCode: string;
  confirmedById: string;
  paidAt: string;
  createdAt: string;
}

// DTO de Estado Financeiro
export interface FinancialStatusDto {
  id: string;
  studentId: string;
  status: FinancialStatusType;
  blockedAt?: string;
  reason?: string;
  updatedAt: string;
}

// DTO de Pedido de Analise / Contestacao
export interface AnalysisRequestDto {
  id: string;
  code: string;
  debtId: string;
  studentId: string;
  reason: string;
  status: AnalysisRequestStatus;
  slaDueDate: string;
  resolvedById?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// DTO de Notificacao Financeira
export interface FinancialNotificationDto {
  id: string;
  studentId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// DTO de Politica Financeira
export interface FinancialPolicyDto {
  id: string;
  code: string;
  gracePeriodDays: number;
  autoBlockEnabled: boolean;
  maxDebtAmount: number;
  updatedAt: string;
}

// DTO do Estado Financeiro Completo (resposta da rota /status)
export interface FinancialStatusSummaryDto {
  studentId: string;
  status: FinancialStatusType;
  reason: string | null;
  blockedAt: string | null;
  overdueDebtsCount: number;
  totalOverdueAmount: number;
  updatedAt: string;
}

// DTO do Historico Financeiro (resposta da rota /history)
export interface FinancialHistoryDto {
  pagination: {
    offset: number;
    limit: number;
    totalPayments: number;
    hasMoreDebts: boolean;
    hasMorePayments: boolean;
  };
  studentId: string;
  debts: DebtDto[];
  payments: PaymentDto[];
  status: FinancialStatusSummaryDto;
  totalDebts: number;
  totalPaid: number;
  totalOutstanding: number;
}

// Contrato proposto de envio para a API externa de Notificacoes.
export interface FinancialNotificationEvent {
  sourceModule: "financial";
  sourceEventId: string;
  recipientUserId: string;
  eventType: string;
  resourceId: string | null;
  title: string;
  message: string;
  channel: "IN_APP";
  occurredAt: string;
}

export interface FinancialNotificationDeliveryDto {
  id: string;
  deliveryStatus: "LOCAL_ONLY" | "PENDING" | "PROCESSING" | "SENT" | "FAILED";
  externalNotificationId: string | null;
  attempts: number;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  sentAt: string | null;
  lastError: string | null;
}
