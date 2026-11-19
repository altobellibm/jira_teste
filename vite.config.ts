import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base: './'` deixa o build independente do endereço onde for hospedado
// (GitHub Pages serve em /<repositório>/). O roteamento é por hash, então não há rotas no servidor.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Testes de tela declaram `@vitest-environment jsdom` no topo do arquivo.
  test: { environment: 'node', include: ['src/**/*.test.{ts,tsx}'] },
});
