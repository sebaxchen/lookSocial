# Guía de Migración de Imports DDD

## ⚠️ IMPORTANTE
Después de crear la nueva estructura DDD, necesitas actualizar TODOS los imports en el proyecto.

## Mapeo de Imports Antiguos a Nuevos

### Task Context
```typescript
// ANTES
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../../learning/domain/model/task.entity';
import { TaskStore } from '../../../../learning/application/task.store';

// DESPUÉS
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../task/domain/entities/task.entity';
import { TaskStore } from '../../../task/infrastructure/adapters/task.store.adapter';
```

### Team Context
```typescript
// ANTES
import { TeamService } from '../../../application/team.service';
import { MemberColorsService } from '../../../application/member-colors.service';

// DESPUÉS
import { TeamService } from '../../../team/application/services/team.service';
import { MemberColorsService } from '../../../shared/infrastructure/services/member-colors.service';
```

### Group Context
```typescript
// ANTES
import { GroupsService } from '../../../application/groups.service';
import { GroupColorsService } from '../../../application/group-colors.service';

// DESPUÉS
import { GroupService } from '../../../group/application/services/group.service';
import { GroupColorsService } from '../../../shared/infrastructure/services/group-colors.service';
```

### Auth Context
```typescript
// ANTES
import { AuthService } from '../../../application/auth.service';
import { AuthGuard } from '../../../application/auth.guard';

// DESPUÉS
import { AuthService } from '../../../auth/application/services/auth.service';
import { authGuard } from '../../../auth/application/guards/auth.guard';
```

## Archivos que Necesitan Actualización

### Vistas de Task
- `src/app/shared/presentation/views/task-list/task-list.ts`
- `src/app/shared/presentation/views/about/about.ts`
- `src/app/shared/presentation/views/dashboard/dashboard.ts`

### Vistas de Team
- `src/app/shared/presentation/components/add-member-modal/add-member-modal.ts`
- `src/app/shared/presentation/components/worker-profile-modal/worker-profile-modal.ts`
- `src/app/shared/presentation/components/assignee-selector/assignee-selector.ts`
- `src/app/shared/presentation/components/multi-assignee-selector/multi-assignee-selector.ts`

### Vistas de Group
- `src/app/shared/presentation/views/groups/groups.ts`
- `src/app/shared/presentation/components/create-group-modal/create-group-modal.ts`
- `src/app/shared/presentation/components/group-profile-modal/group-profile-modal.ts`
- `src/app/shared/presentation/components/group-selector/group-selector.ts`

### Vistas de Auth
- `src/app/shared/presentation/views/login/login.ts`
- `src/app/shared/presentation/views/register/register.ts`
- `src/app/shared/presentation/components/header/header.ts`

### Otros
- `src/app/app.routes.ts` (actualizar authGuard)
- Todos los archivos que importen servicios de shared/application

## Comandos para Buscar y Reemplazar

### Buscar todos los imports de TaskStore
```bash
grep -r "learning/application/task.store" src/
```

### Buscar todos los imports de TeamService
```bash
grep -r "shared/application/team.service" src/
```

### Buscar todos los imports de GroupsService
```bash
grep -r "shared/application/groups.service" src/
```

### Buscar todos los imports de AuthService
```bash
grep -r "shared/application/auth.service" src/
```

## Estado de Migración

- [x] Estructura de bounded contexts creada
- [ ] Imports actualizados en task-list
- [ ] Imports actualizados en about
- [ ] Imports actualizados en dashboard
- [ ] Imports actualizados en groups
- [ ] Imports actualizados en calendar
- [ ] Imports actualizados en shared-files
- [ ] Imports actualizados en componentes
- [ ] Rutas actualizadas en app.routes.ts
- [ ] Todas las referencias a AuthGuard actualizadas

