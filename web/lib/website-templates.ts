import { getPool } from './db';

export interface WebsiteTemplate {
  slug: string;
  name: string;
  description: string;
  previewImageUrl: string | null;
  category: string;
}

interface WebsiteTemplateRow {
  slug: string;
  name: string;
  description: string;
  preview_image_url: string | null;
  category: string;
}

function toTemplate(row: WebsiteTemplateRow): WebsiteTemplate {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    previewImageUrl: row.preview_image_url,
    category: row.category,
  };
}

export async function listWebsiteTemplates(): Promise<WebsiteTemplate[]> {
  const result = await getPool().query<WebsiteTemplateRow>(
    'SELECT slug, name, description, preview_image_url, category FROM website_templates ORDER BY display_order',
  );
  return result.rows.map(toTemplate);
}
