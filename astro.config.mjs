import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://hamerkaz-site.vercel.app', // TODO: real domain
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
