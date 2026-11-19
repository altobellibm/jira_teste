// Modelo declarativo dos formulários. Cada tela do portal é renderizada a partir de um FormDef,
// então acrescentar um campo ou trocar uma lista é editar dados, não componentes.

export interface Option { id: string; label: string }

export type FieldKind =
  | 'text'        // linha única
  | 'textarea'    // texto longo, sem formatação
  | 'richtext'    // texto longo com barra de formatação (markdown leve)
  | 'code'        // bloco de código em fonte monoespaçada
  | 'select'
  | 'multiselect'
  | 'date'        // YYYY-MM-DD
  | 'datetime';   // YYYY-MM-DDTHH:mm

export type Value = string | string[];
export type Values = Record<string, Value>;

export interface FieldDef {
  id: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  placeholder?: string;
  options?: Option[];
  /** Valor inicial: cabeçalho do plano de implementação, "Automático" no Responsável etc. */
  initial?: string;
  /** Este campo de data/hora não pode ser anterior ao campo indicado. */
  notBefore?: { field: string; message: string };
  /** Mostra o atalho "Atribuir a mim" ao lado do rótulo. */
  assignToMe?: boolean;
}

/** Trecho da Descrição montada a partir dos campos (modelos do RH). */
export type DescriptionPart = { text: string } | { field: string };

export interface FormDef {
  id: string;
  title: string;
  /** "Tipo do ticket" no Jira (issue type). */
  issueType: string;
  /** "Tipo de solicitação" no Jira (request type). O Suporte não tem. */
  requestType: string | null;
  /** Campo personalizado "Suporte: Catálogo de Serviço", usado no lugar do tipo de solicitação. */
  serviceCatalog?: string;
  fields: FieldDef[];
  /** Quando presente, a Descrição do ticket é montada a partir dos campos. */
  descriptionLayout?: DescriptionPart[];
}
