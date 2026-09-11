import { getBusinessContext } from './business-context';
import { getSocialLinks } from './social-links';
import { listActiveProducts } from './products';
import type { TenantWebsite } from './tenant-websites';
import type { TenantSiteContent } from '../components/site-templates/types';

// Arma el contenido real del sitio publico reusando lo que el cliente ya completo
// en /dashboard/negocio, /dashboard/redes y /dashboard/inventario - sin duplicar
// el dato en una tabla aparte. Mismo criterio que ya usan los gerentes IA al leer
// este mismo contexto (agents/_shared/business-context-tool.ts).
export async function buildTenantSiteContent(
  tenantId: string,
  tenantName: string,
  website: TenantWebsite,
): Promise<TenantSiteContent> {
  const [businessContext, socialLinks, products] = await Promise.all([
    getBusinessContext(tenantId),
    getSocialLinks(tenantId),
    listActiveProducts(tenantId),
  ]);

  const about = [businessContext.objective, businessContext.productsServices].filter(Boolean).join('\n\n');

  return {
    businessName: website.businessNameOverride || tenantName,
    tagline: website.tagline,
    logoUrl: website.logoStoragePath ? `/${website.logoStoragePath}` : null,
    colors: {
      primary: website.colorPrimary,
      secondary: website.colorSecondary,
      background: website.colorBackground,
    },
    about,
    products:
      businessContext.businessType === 'servicio'
        ? []
        : products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            priceClp: p.priceClp,
            photoUrl: p.photoStoragePaths[p.coverPhotoIndex] ? `/${p.photoStoragePaths[p.coverPhotoIndex]}` : null,
          })),
    contact: {
      instagram: socialLinks.instagram,
      facebook: socialLinks.facebook,
      tiktok: socialLinks.tiktok,
      linkedin: socialLinks.linkedin,
      xTwitter: socialLinks.xTwitter,
      youtube: socialLinks.youtube,
      website: socialLinks.website,
    },
  };
}
