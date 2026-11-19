import { mockApi } from './mock';
import type { CreatedTicket, NewTicketInput } from './types';

/**
 * Contrato entre o front e o back. Hoje só existe a implementação simulada (`mock.ts`).
 * Na fase do Jira real, uma segunda implementação chama o BFF, que guarda o token do Jira.
 */
export interface PortalApi {
  createTicket(input: NewTicketInput): Promise<CreatedTicket>;
}

export const api: PortalApi = mockApi;
/** Verdadeiro enquanto os chamados não são enviados a um Jira real. */
export const isMock = true;
