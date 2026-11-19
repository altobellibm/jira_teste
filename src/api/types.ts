import type { Values } from '../forms/types';

/** O que o portal envia ao criar um chamado. O BFF traduz isso para a API do Jira. */
export interface NewTicketInput {
  formId: string;
  /** "Tipo do ticket" (issue type). */
  issueType: string;
  /** "Tipo de solicitação" (request type); vazio no Suporte. */
  requestType: string | null;
  /** Campo "Suporte: Catálogo de Serviço", quando o tipo usa esse campo. */
  serviceCatalog?: string;
  summary: string;
  /** Descrição final: o campo Descrição, ou o texto montado a partir dos campos do modelo (RH). */
  description: string;
  /** Valores brutos de todos os campos, por id. */
  values: Values;
}

export interface CreatedTicket {
  key: string;
  createdAt: string;
  /** Link para o ticket no Jira. Só existe com o Jira real. */
  url?: string;
  input: NewTicketInput;
}
