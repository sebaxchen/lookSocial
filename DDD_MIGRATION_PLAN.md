# Plan de Migración a DDD

## Estructura Objetivo

```
src/app/
├── task/                    # Bounded Context: Task Management
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── services/
│   ├── application/
│   │   ├── use-cases/
│   │   ├── services/
│   │   └── dto/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   └── persistence/
│   └── presentation/
│       ├── components/
│       └── views/
│
├── team/                    # Bounded Context: Team Management
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── group/                   # Bounded Context: Group Management
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── auth/                    # Bounded Context: Authentication
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── file/                    # Bounded Context: File Sharing
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── calendar/                # Bounded Context: Calendar
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── learning/                # Bounded Context: Learning (ya existe)
│   └── [estructura existente mejorada]
│
└── shared/                  # Componentes UI compartidos
    └── presentation/
        └── components/
```

## Mapeo de Archivos Actuales a Nueva Estructura

### Task Context
- `learning/domain/model/task.entity.ts` → `task/domain/entities/task.entity.ts`
- `learning/application/task.store.ts` → `task/infrastructure/repositories/task.repository.ts` + `task/application/services/task.service.ts`
- `shared/presentation/views/task-list/` → `task/presentation/views/task-list/`
- `shared/presentation/views/about/` → `task/presentation/views/about/`
- `shared/presentation/views/dashboard/` → `task/presentation/views/dashboard/`
- `shared/presentation/components/task-detail-modal/` → `task/presentation/components/task-detail-modal/`
- `shared/presentation/components/confirm-delete-task-modal/` → `task/presentation/components/confirm-delete-task-modal/`

### Team Context
- `shared/application/team.service.ts` → `team/application/services/team.service.ts`
- `shared/application/member-colors.service.ts` → `team/infrastructure/services/member-colors.service.ts`
- `shared/presentation/components/add-member-modal/` → `team/presentation/components/add-member-modal/`
- `shared/presentation/components/worker-profile-modal/` → `team/presentation/components/worker-profile-modal/`
- `shared/presentation/components/assignee-selector/` → `team/presentation/components/assignee-selector/`
- `shared/presentation/components/multi-assignee-selector/` → `team/presentation/components/multi-assignee-selector/`

### Group Context
- `shared/application/groups.service.ts` → `group/application/services/group.service.ts`
- `shared/application/group-colors.service.ts` → `group/infrastructure/services/group-colors.service.ts`
- `shared/presentation/views/groups/` → `group/presentation/views/groups/`
- `shared/presentation/components/create-group-modal/` → `group/presentation/components/create-group-modal/`
- `shared/presentation/components/group-profile-modal/` → `group/presentation/components/group-profile-modal/`
- `shared/presentation/components/group-selector/` → `group/presentation/components/group-selector/`

### Auth Context
- `shared/application/auth.service.ts` → `auth/application/services/auth.service.ts`
- `shared/application/auth.guard.ts` → `auth/application/guards/auth.guard.ts`
- `shared/application/user.service.ts` → `auth/application/services/user.service.ts`
- `shared/presentation/views/login/` → `auth/presentation/views/login/`
- `shared/presentation/views/register/` → `auth/presentation/views/register/`

### File Context
- `shared/presentation/views/shared-files/` → `file/presentation/views/shared-files/`

### Calendar Context
- `shared/presentation/views/calendar/` → `calendar/presentation/views/calendar/`

### Shared (UI Components)
- `shared/presentation/components/empty-state/` → `shared/presentation/components/empty-state/`
- `shared/presentation/components/status-selector/` → `shared/presentation/components/status-selector/`
- `shared/presentation/components/header/` → `shared/presentation/components/header/`
- `shared/presentation/components/layout/` → `shared/presentation/components/layout/`
- `shared/presentation/components/break-modal/` → `shared/presentation/components/break-modal/`
- `shared/presentation/components/settings-modal/` → `shared/presentation/components/settings-modal/`
- `shared/presentation/components/lottie-animation/` → `shared/presentation/components/lottie-animation/`
- `shared/presentation/views/landing/` → `shared/presentation/views/landing/`
- `shared/presentation/views/splash/` → `shared/presentation/views/splash/`
- `shared/presentation/views/page-not-found/` → `shared/presentation/views/page-not-found/`
- `shared/presentation/views/home/` → `shared/presentation/views/home/`

### Services Compartidos
- `shared/application/session-timer.service.ts` → `shared/infrastructure/services/session-timer.service.ts`
- `shared/application/view-preferences.service.ts` → `shared/infrastructure/services/view-preferences.service.ts`

