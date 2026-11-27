# FlowTrade — ByteBuilders

Plataforma web de comercio electrónico. Frontend React/Vite y base de datos Supabase (PostgreSQL). El checkout utiliza la función RPC `place_order` y pagos simulados. El panel administrativo permanece pendiente en el alcance revisado.

## Instalación local

Requisitos: Git, Node.js compatible con la versión de Vite del proyecto y npm. Acceso autorizado al proyecto Supabase.

```powershell
git clone https://github.com/Hugolo6/Flow_Trade.git
cd Flow_Trade/frontend
npm.cmd install
```

Crear `frontend/.env.local` con los valores públicos del proyecto autorizado:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

Nunca utilizar `service_role` en el frontend ni publicar `.env.local`. Verificar políticas RLS en la base de datos.

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
npm.cmd run preview
```

Abrir la URL que indique Vite. Si aparece el aviso de datos de demostración, revisar la configuración y conexión antes de validar operaciones reales.

## Organización

- `frontend/src/pages`: pantallas de catálogo, autenticación, checkout y pedidos.
- `frontend/src/store`: estado de la aplicación.
- `frontend/src/hooks`: sincronización de cuenta.
- `frontend/src/lib`: integración y utilidades.

## Calidad y pruebas

Las pruebas son manuales. Consultar la matriz de Fase 6, registrar ambiente, versión, fecha, resultado y evidencia. QA reportó 31/31 casos originales aprobados; los módulos administrativos y las verificaciones complementarias se gestionan en el plan de cierre. No utilizar datos personales ni tarjetas reales para pruebas.

## Control de cambios

Trabajar en ramas feature/* o fix/*, vincular tareas autorizadas por el PM, utilizar Conventional Commits y solicitar revisión antes de fusionar a develop. El PM administra Jira y la aceptación del cliente.
