# Boss Birthday 27 RSVP

Para guardar respuestas reales de invitados en móviles distintos, crea esta tabla en Supabase y añade las variables de entorno indicadas abajo.

```sql
create table public.bossbirthday_27_rsvps (
  id uuid primary key,
  guest_id text,
  name text not null,
  attending boolean not null,
  comment text,
  submitted_at timestamptz not null default now()
);
```

Variables necesarias:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
BOSSBIRTHDAY_ADMIN_KEY="una-clave-privada-para-ver-el-admin"
```

Opcional:

```bash
BOSSBIRTHDAY_RSVP_TABLE="bossbirthday_27_rsvps"
```

El admin vive en:

```text
/bossbirthday/27/admin?key=una-clave-privada-para-ver-el-admin
```

Sin Supabase configurado, la API usa memoria del servidor para desarrollo local. Eso no sirve como persistencia real en producción.
