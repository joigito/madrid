# Madrid Gestión de Comercio Internacional

Espacio de trabajo privado para el operador de comercio internacional: el **expediente de importación** es la unidad central, con sus 7 etapas, el organismo responsable de cada una y sus vencimientos.

## Etapas de la importación

| # | Etapa | Organismo | Plazo desde el inicio |
|---|-------|-----------|------------------------|
| 1 | Contrato de compra y orden de importación | — | 7 días |
| 2 | Transferencia y documentación bancaria | BCRA | 14 días |
| 3 | Padrón de importadores y habilitación | ARCA | 15 días |
| 4 | Solicitud de SIRA / SIE | ARCA | 20 días |
| 5 | Despacho aduanero y liberación de mercadería | ARCA | 45 días |
| 6 | Registro y verificación ante el organismo sectorial | VUCE | 55 días |
| 7 | Cierre contable y control de vencimientos | — | 60 días |

Cada etapa trae el link oficial del organismo y una fecha límite sugerida que se recalcula según la fecha de inicio del expediente. Todo es editable: los plazos y los organismos cambian según el régimen y el tipo de mercadería.

## Contactos

Proveedores y clientes viven en la misma tabla porque son la misma clase de entidad: una empresa o persona del exterior con la que operás. Cada contacto tiene dos casilleros independientes, **Proveedor** (te vende) y **Cliente** (te compra), y puede tener los dos a la vez.

El expediente elige proveedor y cliente de esa lista en vez de escribir el nombre a mano. Los contactos no se borran, se **archivan**: dejan de aparecer en los selectores pero las operaciones históricas siguen mostrando sus datos.

## Stack

- **Next.js 16** (App Router, Turbopack, proxy en Node.js) — Server Actions para todas las escrituras
- **SQLite** (`better-sqlite3`, archivo en `data/madrid.db`) — sin servicios externos ni cuotas
- **Auth propia** — `crypto.scrypt` para las contraseñas y sesiones en cookie `httpOnly` con token aleatorio guardado hasheado (SHA-256) en la tabla `sessions`
- **Tailwind CSS 4**
- **Modo oscuro** — variante `dark` de Tailwind con la preferencia en la cookie `tema`: el servidor renderiza con el tema correcto (sin destello al cargar) y el botón del header cambia el tema al instante en el cliente
- **PWA instalable** — `app/manifest.ts` con iconos generados por `pnpm iconos` (incluida la variante *maskable* para Android), `theme-color` según el tema activo y `apple-touch-icon`: se puede usar desde el teléfono como una app más ("Agregar a pantalla de inicio"), con `display: standalone` y sin barra de navegador

## Correr en local

```bash
pnpm install
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000). La base se crea sola en `data/madrid.db` con el catálogo de las 7 etapas sembrado en el primer arranque: no hay configuración ni variables de entorno.

## Cómo está organizado

```
src/lib/db/          conexión + esquema (SCHEMA_SQL) y seed del catálogo
src/lib/auth/        contraseñas (scrypt), sesiones en cookie y server actions de login/registro/logout
src/lib/contactos/   queries y server actions de proveedores/clientes (dos roles independientes, archivar en vez de borrar)
src/lib/operaciones/ queries y server actions del expediente (todas filtran por user_id)
src/proxy.ts         guardia de rutas: sin sesión no se entra, con sesión no se ve /login
src/lib/domain/      tipos del dominio y el semáforo de vencimientos
```

## Seguridad

- Cada query filtra por `user_id` — el aislamiento entre usuarios está en el código, no delegado en la base (antes lo resolvía Row Level Security).
- El proxy rechaza cualquier ruta privada sin sesión válida; las páginas además se chequean por su cuenta.
- Contraseñas con `scrypt` (N=16384) y comparación en tiempo constante.
- Cookie de sesión: `httpOnly`, `SameSite=Lax`, `Secure` en producción, 30 días de vigencia. En la base solo se guarda el hash del token.
- `data/` está en `.gitignore`: la base nunca se commitea.

## Despliegue (VPS)

```bash
pnpm build
sudo cp deploy/madrid.service /etc/systemd/system/madrid.service
sudo systemctl daemon-reload
sudo systemctl enable --now madrid     # escucha en :3000

systemctl status madrid
journalctl -u madrid -f
```

Caddy hace de reverse proxy con HTTPS en `https://madridext.duckdns.org` → `host.docker.internal:3000` (ver `/root/n8n-docker-caddy/Caddyfile`).

**Backups**: `pnpm backup` deja una copia consistente en `backups/` (API de backup de SQLite, se puede hacer con la base en uso) y borra las de más de 14 días. El cron corre todos los días a las 03:00 y loguea en `/var/log/madrid-backup.log`.
