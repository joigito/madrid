# Madrid Gestión de Comercio Exterior

Espacio de trabajo privado para el operador de comercio exterior: el **expediente de importación** es la unidad central, con sus 7 etapas, el organismo responsable de cada una y sus vencimientos.

## Etapas de la importación

| # | Etapa | Organismo | Plazo desde el inicio |
|---|-------|-----------|------------------------|
| 1 | Pedido al proveedor / negociación | — | 5 días |
| 2 | Pago / medio de pago | BCRA | 20 días |
| 3 | Preparación y embarque | — | 50 días |
| 4 | Arribo y despacho aduanero | ARCA | 55 días |
| 5 | Intervenciones de organismos | VUCE | 65 días |
| 6 | Nacionalización / tributos | ARCA | 70 días |
| 7 | Entrega / logística interna | — | 77 días |

Cada etapa trae el link oficial del organismo y una fecha límite sugerida que se recalcula según la fecha de inicio del expediente. Todo es editable: los plazos y los organismos cambian según el régimen y el tipo de mercadería.

## Stack

- **Next.js 16** (App Router, Turbopack) — en el servidor, con Server Actions para las escrituras
- **Supabase** — Auth por email/contraseña + Postgres con Row Level Security por usuario
- **Tailwind CSS 4**

## Correr en local

```bash
pnpm install

# Supabase local (requiere Docker)
supabase start
supabase db reset

# Variables de entorno
cp .env.example .env.local   # y completar con `supabase status`

pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Seguridad

- `supabase/migrations/0001_schema.sql` define RLS en todas las tablas (`user_id` + `auth.uid()`) **y** los `GRANT` de tabla explícitos: sin ellos PostgREST responde `403` aunque las políticas estén bien.
- `.env.local` nunca se commitea; `.env.example` es un template vacío.
