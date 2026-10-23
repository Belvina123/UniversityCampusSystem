export type RoleCode =
  | 'STUDENT'
  | 'TEACHER'
  | 'TECHNICIAN'
  | 'COORDINATOR'
  | 'ADMIN';

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

export type BuildingDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  floors: number;
  roomsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type LaboratoryDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  buildingId: string;
  building: { id: string; code: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type EquipmentDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  roomId: string | null;
  laboratoryId: string | null;
  room: { id: string; code: string; name: string } | null;
  laboratory: { id: string; code: string; name: string } | null;
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
    label: 'OperaÃ§Ãµes',
    path: '/ops',
    description: 'Centro de operaÃ§Ãµes com mapa, mÃ©tricas ambientais e padrÃµes do campus.',
    status: 'available',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'VisÃ£o geral do campus e indicadores operacionais.',
    status: 'available',
  },
  {
    key: 'users',
    label: 'Utilizadores e perfis',
    path: '/users',
    description: 'GestÃ£o de utilizadores, roles e perfis.',
    status: 'available',
    requiredRoles: ['ADMIN', 'COORDINATOR'],
  },
  {
    key: 'academic',
    label: 'GestÃ£o acadÃ©mica',
    path: '/academic',
    description: 'Hub acadÃ©mico: departamentos, cursos e planos.',
    status: 'partial',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'departments',
    label: 'Departamentos',
    path: '/departments',
    description: 'Estrutura departamental da universidade.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'courses',
    label: 'Cursos',
    path: '/courses',
    description: 'CatÃ¡logo de cursos e programas.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'subjects',
    label: 'Disciplinas',
    path: '/subjects',
    description: 'Disciplinas e planos curriculares.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'students',
    label: 'Estudantes',
    path: '/students',
    description: 'Dados acadÃ©micos de estudantes.',
    status: 'partial',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'teachers',
    label: 'Docentes',
    path: '/teachers',
    description: 'Perfil e afectaÃ§Ã£o de docentes.',
    status: 'partial',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'enrolments',
    label: 'MatrÃ­culas',
    path: '/enrolments',
    description: 'MatrÃ­culas e inscriÃ§Ãµes.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'assessments',
    label: 'AvaliaÃ§Ãµes e notas',
    path: '/assessments',
    description: 'AvaliaÃ§Ãµes, notas e actas.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'schedules',
    label: 'HorÃ¡rios e assiduidade',
    path: '/schedules',
    description: 'HorÃ¡rios lectivos e registo de presenÃ§a.',
    status: 'development',
    groupHint: 'Grupo AcadÃ©mico',
  },
  {
    key: 'campus',
    label: 'Campus fÃ­sico',
    path: '/campus',
    description: 'EdifÃ­cios, salas e espaÃ§os do campus.',
    status: 'partial',
    groupHint: 'Grupo GestÃ£o de Campus',
  },
  {
    key: 'buildings',
    label: 'EdifÃ­cios',
    path: '/buildings',
    description: 'Cadastro de edifÃ­cios.',
    status: 'available',
    groupHint: 'Grupo GestÃ£o de Campus',
  },
  {
    key: 'rooms',
    label: 'Salas',
    path: '/rooms',
    description: 'Salas e disponibilidade.',
    status: 'available',
    groupHint: 'Grupo GestÃ£o de Campus',
  },
  {
    key: 'laboratories',
    label: 'LaboratÃ³rios',
    path: '/laboratories',
    description: 'LaboratÃ³rios e espaÃ§os tÃ©cnicos.',
    status: 'available',
    groupHint: 'Grupo GestÃ£o de Campus',
  },
  {
    key: 'equipment',
    label: 'Equipamentos',
    path: '/equipment',
    description: 'InventÃ¡rio de equipamentos.',
    status: 'available',
    groupHint: 'Grupo GestÃ£o de Campus',
  },
  {
    key: 'incidents',
    label: 'OcorrÃªncias',
    path: '/incidents',
    description: 'Pedidos e tratamento de ocorrÃªncias.',
    status: 'available',
    groupHint: 'Grupo ManutenÃ§Ã£o',
  },
  {
    key: 'maintenance',
    label: 'ManutenÃ§Ã£o',
    path: '/maintenance',
    description: 'AcÃ§Ãµes de manutenÃ§Ã£o associadas a ocorrÃªncias.',
    status: 'partial',
    groupHint: 'Grupo ManutenÃ§Ã£o',
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
    description: 'Parque de viaturas, vagas e leitura de matrÃ­culas.',
    status: 'available',
    groupHint: 'Grupo GestÃ£o de Campus / IoT',
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
    label: 'NotificaÃ§Ãµes',
    path: '/notifications',
    description: 'Centro de notificaÃ§Ãµes do utilizador.',
    status: 'development',
    groupHint: 'Grupo Core',
  },
  {
    key: 'reports',
    label: 'RelatÃ³rios',
    path: '/reports',
    description: 'Indicadores e relatÃ³rios agregados.',
    status: 'development',
    groupHint: 'Grupo RelatÃ³rios',
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
    label: 'AdministraÃ§Ã£o',
    path: '/admin',
    description: 'AdministraÃ§Ã£o do sistema e configuraÃ§Ã£o.',
    status: 'partial',
    requiredRoles: ['ADMIN'],
  },
];


type Ref = { id: string; code: string; name: string };

export type DepartmentDto = {
  id: string; code: string; name: string; description: string | null;
  createdAt: string; updatedAt: string;
};
export type CourseDto = {
  id: string; code: string; name: string; description: string | null;
  departmentId: string; department: Ref; createdAt: string; updatedAt: string;
};
export type SubjectDto = {
  id: string; code: string; name: string; credits: number;
  courseId: string; course: Ref; createdAt: string; updatedAt: string;
};