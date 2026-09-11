import { NextResponse } from 'next/server';
import { getCurrentTenant } from '../../../../../../lib/tenant';
import { getReportById } from '../../../../../../lib/queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) return new NextResponse('No autorizado', { status: 401 });

  const report = await getReportById(tenant.id, id);
  if (!report) return new NextResponse('No encontrado', { status: 404 });

  const day = new Date(report.createdAt).toISOString().slice(0, 10);
  const filename = `pauta-${report.slug}-${day}.txt`;
  const body =
    `${report.agentName}\n${new Date(report.createdAt).toLocaleString('es-CL')}\n` +
    `${'-'.repeat(40)}\n\n${report.summary}\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
