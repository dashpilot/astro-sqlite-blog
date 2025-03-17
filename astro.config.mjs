// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import svelte from '@astrojs/svelte';

import node from '@astrojs/node';

export default defineConfig({
  integrations: [tailwind(), svelte()],
  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),
});