import type { RequestArea } from './definitions';

export interface Selection { areaId: string; kindId: string }

/**
 * Lê `?area=&tipo=` do link (ex.: #/requisicao?area=suporte&tipo=criacao-usuario) e devolve a seleção válida.
 * Valores desconhecidos são ignorados. Se a área só tem um tipo, ele é escolhido sozinho.
 */
export function resolveSelection(catalog: RequestArea[], area: string | null, kind: string | null): Selection {
  const found = catalog.find((a) => a.id === area);
  if (!found) return { areaId: '', kindId: '' };
  if (found.kinds.length === 1) return { areaId: found.id, kindId: found.kinds[0].id };
  return { areaId: found.id, kindId: found.kinds.some((k) => k.id === kind) ? (kind as string) : '' };
}
