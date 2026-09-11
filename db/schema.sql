-- AIdmin - esquema base de datos
-- Disenado para Postgres 18 local (Docker) hoy, Supabase en produccion.
-- gen_random_uuid() es nativo desde Postgres 15, no requiere extension.

-- Una fila por pyme cliente de la plataforma. clerk_org_id vincula con la
-- Organization de Clerk que agrupa a los usuarios de esa pyme (panel cliente).
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- razon social
  slug TEXT UNIQUE, -- identificador amigable para la URL publica del sitio (/sitio/<slug>)
  rut TEXT,
  plan TEXT NOT NULL DEFAULT 'piloto' CHECK (plan IN ('piloto', 'completo', 'agencia')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (
    status IN ('trial', 'active', 'paused', 'cancelled')
  ),
  clerk_org_id TEXT UNIQUE,
  -- Tope de tokens (input+output) por agente por dia. Protege el costo real de
  -- AIdmin como negocio; el agente igual corre todos los dias, solo deja de llamar
  -- al modelo si un agente puntual se pasa de su presupuesto de HOY (ver
  -- agents/_shared/usage.ts). Default generoso para Sonnet, ajustable por pyme -
  -- tiene sentido subirlo en planes superiores.
  daily_token_cap_per_agent INTEGER NOT NULL DEFAULT 200000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cada pyme tiene su propia instancia de los 6 agentes: slug ya no es unico global,
-- es unico por tenant (dos pymes pueden tener cada una su propio 'desarrollo').
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  slug TEXT NOT NULL, -- 'desarrollo' | 'marketing' | 'finanzas' | 'producto' | 'legal' | 'ceo'
  name TEXT NOT NULL,
  role_description TEXT NOT NULL,
  -- Nivel de autonomia declarado (referencia; el enforcement real vive en approval-gate,
  -- no en esta columna).
  autonomy_level TEXT NOT NULL CHECK (
    autonomy_level IN ('recommend_only', 'propose_only', 'act_low_risk', 'act_with_gate')
  ),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents (tenant_id);

-- Personalidad y habilidades de cada ROL de agente (no por tenant - las 6 pymes
-- comparten el mismo "Marketing", editable desde /admin/agentes). Separado a
-- proposito de los limites de autonomia y reglas de gobernanza, que siguen viviendo
-- solo en agents/<slug>/constitution.md: este panel nunca debe poder aflojar una
-- regla de seguridad (aprobacion humana de plata/contenido publico), solo como el
-- agente se presenta y que habilidades tiene declaradas.
CREATE TABLE IF NOT EXISTS agent_profiles (
  slug TEXT PRIMARY KEY CHECK (
    slug IN ('ceo', 'marketing', 'finanzas', 'producto', 'legal', 'desarrollo')
  ),
  persona_name TEXT NOT NULL, -- "Sofia"
  display_name TEXT NOT NULL, -- "Gerente de Marketing"
  personality TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  objective TEXT NOT NULL DEFAULT '',
  extra_instructions TEXT, -- notas libres del admin, se suman al system prompt tal cual
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Documentos/links de referencia que el ADMIN de la plataforma le carga a cada ROL
-- de agente (global, no por tenant - mismo criterio que agent_profiles). Para
-- documentos, url_or_path guarda el storage_path (reusa uploads-storage.ts); para
-- links, guarda la URL tal cual. Leido por get_agent_knowledge_base
-- (agents/_shared/agent-knowledge-tool.ts) - titulo/descripcion se envuelven con
-- asUntrustedContent() antes de llegar al modelo, mismo criterio que el resto del
-- proyecto para cualquier contenido que pueda originarse fuera del sistema.
CREATE TABLE IF NOT EXISTS agent_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT NOT NULL CHECK (
    agent_slug IN ('ceo', 'marketing', 'finanzas', 'producto', 'legal', 'desarrollo')
  ),
  type TEXT NOT NULL CHECK (type IN ('document', 'link')),
  title TEXT NOT NULL,
  url_or_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent_slug ON agent_knowledge (agent_slug);

-- Cada corrida de un agente agrupa uno o mas registros de decisions_log bajo el mismo run_id.
CREATE TABLE IF NOT EXISTS decisions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  decision_type TEXT NOT NULL CHECK (
    decision_type IN ('tool_call', 'reasoning_step', 'action', 'report_generated', 'error')
  ),
  tool_name TEXT, -- NULL cuando decision_type no corresponde a una llamada a tool
  input JSONB,
  output JSONB,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_log_agent_id ON decisions_log (agent_id);
CREATE INDEX IF NOT EXISTS idx_decisions_log_run_id ON decisions_log (run_id);
CREATE INDEX IF NOT EXISTS idx_decisions_log_created_at ON decisions_log (created_at);

-- Toda accion de tipo payment/spend/budget_change/paid_campaign_launch pasa por aqui.
-- El approval-gate SOLO inserta filas en pending_approval; nunca ejecuta la accion real.
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID,
  action_type TEXT NOT NULL CHECK (
    action_type IN ('payment', 'spend', 'budget_change', 'paid_campaign_launch')
  ),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (
    status IN ('pending_approval', 'approved', 'rejected')
  ),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals (status);
CREATE INDEX IF NOT EXISTS idx_approvals_agent_id ON approvals (agent_id);

-- Analogo a `approvals` pero para la otra cosa irreversible que la seccion 1 del
-- proyecto marca como no-negociable: marca publica. Todo contenido organico que un
-- agente quiera publicar en redes reales pasa por aqui primero (content-gate),
-- separado del approval-gate porque es un riesgo distinto al dinero.
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID,
  channel TEXT NOT NULL,
  content_text TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    status IN ('pending_review', 'approved', 'rejected')
  ),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON content_reviews (status);
CREATE INDEX IF NOT EXISTS idx_content_reviews_agent_id ON content_reviews (agent_id);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_agent_id ON reports (agent_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);

-- Uso de tokens agregado por tenant+agente+dia (no una fila por llamada al modelo -
-- alcanza para el tope diario y para el panel admin, y es mucho mas liviano). Se
-- upsertea al final de cada corrida (agents/_shared/usage.ts); Agent.run() la
-- consulta ANTES de llamar al modelo para saber si ya se paso el tope del dia.
CREATE TABLE IF NOT EXISTS agent_usage_daily (
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  agent_slug TEXT NOT NULL,
  usage_date DATE NOT NULL,
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  run_count INTEGER NOT NULL DEFAULT 0,
  capped_run_count INTEGER NOT NULL DEFAULT 0, -- corridas que se saltaron el modelo por tope alcanzado
  PRIMARY KEY (tenant_id, agent_slug, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_usage_daily_tenant ON agent_usage_daily (tenant_id, usage_date);

-- Archivos/fotos que un cliente sube desde el panel para darle contexto a sus
-- gerentes. agent_slug NULL = visible para todos los agentes de ese tenant.
-- El contenido (caption) es dato externo: se envuelve con asUntrustedContent() en
-- agents/_shared/uploads-tool.ts, nunca se pasa crudo al modelo.
CREATE TABLE IF NOT EXISTS client_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  agent_slug TEXT,
  uploaded_by TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'other')),
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_uploads_tenant_id ON client_uploads (tenant_id);

-- Contexto de negocio que la pyme completa desde /dashboard/negocio - una fila por
-- tenant. Es el mismo tipo de pregunta que pide un fondo de capital semilla
-- (problema, mercado, modelo de ingresos, competidores, escalabilidad...), pensado
-- para que CUALQUIER gerente lo lea al correr (get_business_context, ver
-- agents/_shared/business-context-tool.ts) y trabaje con contexto real del negocio
-- en vez de a ciegas. Dato del cliente: se envuelve con asUntrustedContent(), nunca
-- se pasa crudo al modelo.
CREATE TABLE IF NOT EXISTS business_context (
  tenant_id UUID PRIMARY KEY REFERENCES tenants (id) ON DELETE CASCADE,
  -- Gatilla si /dashboard/inventario aplica (una pyme de puro servicio no maneja stock).
  business_type TEXT CHECK (business_type IN ('producto', 'servicio', 'mixto')),
  objective TEXT,
  problem TEXT,
  products_services TEXT,
  target_market TEXT,
  revenue_model TEXT,
  capital_stock TEXT,
  innovation TEXT,
  competitors TEXT,
  scalability TEXT,
  -- Correo del dueno de la pyme al que el CEO manda alertas cuando arma la pauta y
  -- hay algo pendiente (aprobaciones/contenido). NULL = no manda nada. Lo carga el
  -- cliente mismo, no el admin (ver agents/ceo/index.ts).
  owner_alert_email TEXT,
  -- Numero de WhatsApp del dueno para cuando se conecte el canal de WhatsApp
  -- (roadmap, ver docs/architecture.md) - se recolecta desde ya para no partir de
  -- cero el dia que se conecte de verdad. Todavia NO se usa para enviar nada.
  owner_whatsapp_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Handles/URLs de redes sociales que la pyme completa desde /dashboard/redes - una
-- fila por tenant. Solo referencia (texto), no son credenciales ni tokens de
-- conexion real: Marketing sigue con Metricool mockeado este sprint (decision
-- explicita). Lo usa unicamente get_social_links (agents/_shared/social-links-tool.ts),
-- dado a Marketing - los demas gerentes no lo necesitan.
CREATE TABLE IF NOT EXISTS social_links (
  tenant_id UUID PRIMARY KEY REFERENCES tenants (id) ON DELETE CASCADE,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  linkedin TEXT,
  x_twitter TEXT,
  youtube TEXT,
  website TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Catalogo fijo de plantillas de sitio web (datos, no config hardcodeada en cada
-- componente - asi el catalogo se puede ampliar sin tocar codigo). Sembrado por
-- db/seed.sql. Ver web/components/site-templates/registry.ts para el mapeo de
-- cada slug a su composicion real de secciones/paleta por defecto.
CREATE TABLE IF NOT EXISTS website_templates (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_image_url TEXT,
  category TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- El sitio publico de cada pyme - un sitio por tenant en esta fase. La plantilla
-- elegida + personalizacion de colores/info basica vive aca; el contenido real
-- (about, productos, contacto) se arma en runtime reusando business_context,
-- products y social_links - no se duplica el dato.
CREATE TABLE IF NOT EXISTS tenant_websites (
  tenant_id UUID PRIMARY KEY REFERENCES tenants (id) ON DELETE CASCADE,
  template_slug TEXT NOT NULL REFERENCES website_templates (slug),
  business_name_override TEXT,
  tagline TEXT,
  logo_storage_path TEXT,
  color_primary TEXT NOT NULL DEFAULT '#6a4cff',
  color_secondary TEXT NOT NULL DEFAULT '#ff8a5b',
  color_background TEXT NOT NULL DEFAULT '#ffffff',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Inventario de la pyme - solo aplica si business_context.business_type declara
-- 'producto' o 'mixto'. Precio en CLP entero (sin decimales, igual que el resto
-- del proyecto - ver lib/plans.ts). safety_stock_threshold habilita
-- list_low_stock_products (agents/producto/tools.ts).
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_clp INTEGER NOT NULL CHECK (price_clp >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  safety_stock_threshold INTEGER NOT NULL DEFAULT 0 CHECK (safety_stock_threshold >= 0),
  photo_storage_paths TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products (tenant_id);

-- Mantiene *.updated_at al dia sin logica extra en el codigo de la app.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agents_updated_at ON agents;
CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tenants_updated_at ON tenants;
CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_agent_profiles_updated_at ON agent_profiles;
CREATE TRIGGER trg_agent_profiles_updated_at
  BEFORE UPDATE ON agent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_business_context_updated_at ON business_context;
CREATE TRIGGER trg_business_context_updated_at
  BEFORE UPDATE ON business_context
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_social_links_updated_at ON social_links;
CREATE TRIGGER trg_social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tenant_websites_updated_at ON tenant_websites;
CREATE TRIGGER trg_tenant_websites_updated_at
  BEFORE UPDATE ON tenant_websites
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Costo (lo que le cuesta al negocio) y foto de portada, ademas del precio de venta
-- y el arreglo de fotos que ya existia. cover_photo_index es un indice dentro de
-- photo_storage_paths (0 por defecto = la primera foto subida).
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_clp INTEGER CHECK (cost_price_clp >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_photo_index INTEGER NOT NULL DEFAULT 0;

-- Historial de chat en vivo con el CEO (panel cliente, /dashboard/chat). Una fila
-- por mensaje, de cualquiera de los dos lados. No pasa por Agent.run() (ese loop
-- vive en el paquete agents/, separado de web/) - es una conversacion mas liviana,
-- con contexto real (perfil del CEO, negocio, reportes recientes) pero sin tools.
-- Cuenta contra el mismo tope diario de tokens del CEO (agent_usage_daily).
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant_id ON chat_messages (tenant_id, created_at);

-- Conexion real (API key propia de cada pyme) para que Marketing deje de usar datos
-- mock y trabaje con metricas/calendario reales de Metricool. Se guarda por tenant
-- (cada pyme conecta su propia cuenta). El campo nunca se re-renderiza en el
-- formulario una vez guardado (solo un estado "conectado"), para no exponerlo en
-- el HTML de la pagina.
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS metricool_api_key TEXT;
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS metricool_connected_at TIMESTAMPTZ;
