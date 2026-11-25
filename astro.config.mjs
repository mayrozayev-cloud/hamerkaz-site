import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://hamerkaz-ac.co.il',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
