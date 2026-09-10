import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import type { AgentTool } from '../_shared/agent.js';
import { createGetBusinessContextTool } from '../_shared/business-context-tool.js';
import { getPool } from '../_shared/db.js';
import { createGetClientUploadsTool } from '../_shared/uploads-tool.js';

const DOCUMENT_TEMPLATES_PATH = fileURLToPath(
  new URL('./sample-data/document-templates.json', import.meta.url),
);
const LEGAL_CHECKLIST_PATH = fileURLToPath(
  new URL('./sample-data/legal-reference-checklist.json', import.meta.url),
);

interface FlagDocumentInput {
  documentId: string;
  riskLevel: 'alto' | 'menor';
  reason: string;
}

/**
 * Mock de la base de archivos del catalogo de documentos de FIRMA IA. Datos
 * estructurados de ejemplo, sin acceso real a ningun sistema en este sprint.
 */
const listDocumentTemplatesTool: AgentTool = {
  name: 'list_document_templates',
  description: 'Lista el catalogo de plantillas de documentos legales de FIRMA IA (mock).',
  inputSchema: { type: 'object', properties: {} },
  execute() {
    const raw = readFileSync(DOCUMENT_TEMPLATES_PATH, 'utf8');
    return Promise.resolve(JSON.parse(raw) as unknown);
  },
};

/**
 * Checklist de referencia (mock/ilustrativo, no asesoria legal). Sirve como criterio
 * para evaluar cada plantilla, no como fuente normativa autoritativa.
 */
const getLegalReferenceChecklistTool: AgentTool = {
  name: 'get_legal_reference_checklist',
  description:
    'Devuelve un checklist de referencia (mock/ilustrativo) de temas de cumplimiento ' +
    'a revisar en cada plantilla. No reemplaza asesoria legal real.',
  inputSchema: { type: 'object', properties: {} },
  execute() {
    const raw = readFileSync(LEGAL_CHECKLIST_PATH, 'utf8');
    return Promise.resolve(JSON.parse(raw) as unknown);
  },
};

/**
 * UNICA forma en que este agente puede "actuar" sobre el catalogo: deja una marca de
 * revision pendiente. Nunca modifica ni publica el documento real - eso es de
 * Producto, y solo tras aprobacion humana.
 */
const flagDocumentForLegalReviewTool: AgentTool<FlagDocumentInput> = {
  name: 'flag_document_for_legal_review',
  description:
    'Marca un documento del catalogo como pendiente de revision legal humana. NUNCA ' +
    'modifica ni publica el documento - solo deja constancia para que Producto/Atilio lo vean.',
  inputSchema: {
    type: 'object',
    properties: {
      documentId: { type: 'string' },
      riskLevel: { type: 'string', enum: ['alto', 'menor'] },
      reason: { type: 'string' },
    },
    required: ['documentId', 'riskLevel', 'reason'],
  },
  execute(input) {
    return Promise.resolve({
      documentId: input.documentId,
      riskLevel: input.riskLevel,
      reason: input.reason,
      status: 'flagged_pending_human_review',
      note: 'No se modifico el catalogo real. Requiere revision de Producto/Atilio.',
    });
  },
};

function toGenericTool<TInput>(tool: AgentTool<TInput>): AgentTool {
  return tool as unknown as AgentTool;
}

export function createLegalTools(tenantId: string, pool: Pool = getPool()): AgentTool[] {
  return [
    toGenericTool(listDocumentTemplatesTool),
    toGenericTool(getLegalReferenceChecklistTool),
    toGenericTool(flagDocumentForLegalReviewTool),
    createGetBusinessContextTool(tenantId, pool),
    createGetClientUploadsTool(tenantId, 'legal', pool),
  ];
}
