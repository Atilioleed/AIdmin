// Arranca los 8 servidores HTTP livianos (approval-gate, content-gate y los 6
// trigger-servers de los agentes) en UN SOLO proceso Node, en vez de 8 procesos
// separados. Cada uno ya era una funcion exportada e independiente (startXServer),
// asi que esto no toca su logica - solo evita pagar 8 veces el overhead base de un
// runtime Node en un servidor con memoria acotada. n8n sigue siendo su propio
// proceso aparte (imagen oficial, con su propio ciclo de vida).
import 'dotenv/config';
import { startCeoTriggerServer } from '../../agents/ceo/trigger-server.js';
import { startDesarrolloTriggerServer } from '../../agents/desarrollo/trigger-server.js';
import { startFinanzasTriggerServer } from '../../agents/finanzas/trigger-server.js';
import { startLegalTriggerServer } from '../../agents/legal/trigger-server.js';
import { startMarketingTriggerServer } from '../../agents/marketing/trigger-server.js';
import { startProductoTriggerServer } from '../../agents/producto/trigger-server.js';
import { startApprovalGateServer } from '../../approval-gate/server.js';
import { startContentGateServer } from '../../content-gate/server.js';

startApprovalGateServer(Number(process.env.APPROVAL_GATE_PORT ?? 4000));
startContentGateServer(Number(process.env.CONTENT_GATE_PORT ?? 4001));
startDesarrolloTriggerServer(Number(process.env.DESARROLLO_TRIGGER_PORT ?? 4100));
startFinanzasTriggerServer(Number(process.env.FINANZAS_TRIGGER_PORT ?? 4101));
startLegalTriggerServer(Number(process.env.LEGAL_TRIGGER_PORT ?? 4102));
startProductoTriggerServer(Number(process.env.PRODUCTO_TRIGGER_PORT ?? 4103));
startCeoTriggerServer(Number(process.env.CEO_TRIGGER_PORT ?? 4104));
startMarketingTriggerServer(Number(process.env.MARKETING_TRIGGER_PORT ?? 4105));

console.log('[all-servers] los 8 servidores HTTP estan arriba en un solo proceso.');
