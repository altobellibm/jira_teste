import type { PortalApi } from './client';

/** Implementação simulada: gera a chave do chamado e não envia nada a lugar nenhum. */
export function createMockApi({ delayMs = 600, lastNumber = 100 } = {}): PortalApi {
  let seq = lastNumber;
  return {
    async createTicket(input) {
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
      seq += 1;
      return { key: `REP-${seq}`, createdAt: new Date().toISOString(), input };
    },
  };
}

export const mockApi = createMockApi();
