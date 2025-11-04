# Estado de Reorganización DDD

## ⚠️ ADVERTENCIA
Esta es una reorganización completa que afectará todos los imports del proyecto. 
Se recomienda hacerlo en un branch separado y probar cuidadosamente.

## Progreso

### ✅ Completado
1. Creado plan de migración
2. Creado Task Entity en estructura DDD
3. Creado Task Repository Interface

### 🔄 En Progreso
- Creando estructura de bounded contexts
- Moviendo archivos a sus nuevas ubicaciones
- Actualizando imports

### 📋 Pendiente
- [ ] Crear todos los bounded contexts (task, team, group, auth, file, calendar)
- [ ] Mover archivos de domain
- [ ] Mover archivos de application
- [ ] Mover archivos de infrastructure
- [ ] Mover archivos de presentation
- [ ] Actualizar todos los imports en el proyecto
- [ ] Actualizar rutas en app.routes.ts
- [ ] Probar que todo funciona

## Estructura Objetivo

```
src/app/
├── task/
│   ├── domain/
│   │   ├── entities/
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
├── team/
├── group/
├── auth/
├── file/
├── calendar/
└── shared/
```

## Notas Importantes

- Los imports cambiarán de `learning/domain/model/task.entity` a `task/domain/entities/task.entity`
- Los servicios se moverán de `shared/application/` a sus respectivos bounded contexts
- Los componentes de presentación se moverán a sus bounded contexts correspondientes
- Se mantendrá `shared/` solo para componentes UI realmente compartidos

