# Central de Chamados Wiise

Formulários de abertura de chamados (Incidente, Requisição, Mudança e, em breve, Problema) para a equipe da Wiise. Cada cartão do Confluence (WIISE HUB) aponta para uma rota deste portal. Hoje os dados são **simulados**: nada é enviado ao Jira.

React 19, TypeScript, Vite e React Router 7. O visual vem do design system "Wiise Central de Ajuda" (`src/styles/tokens.css`, `wiise.css` e `app.css`, copiados sem alteração).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # lógica dos formulários e fluxos de tela
npm run build      # gera dist/
```

## Links para o Confluence

O roteamento é por hash, então funciona em qualquer hospedagem estática. Em produção o endereço fica `https://<host>/#/<rota>`.

| Rota | Tela |
| --- | --- |
| `#/incidente` | Relatar um Incidente: Resumo e Descrição |
| `#/requisicao` | Fazer uma requisição: Área, depois Tipo, depois o formulário |
| `#/requisicao?area=suporte&tipo=criacao-usuario` | A mesma tela, já com Área e Tipo escolhidos |
| `#/mudanca` | Registrar uma Mudança: 16 campos |
| `#/problema` | Reportar um problema: placeholder "a definir" |
| `#/` | Redireciona para `#/requisicao` |

Valores aceitos em `?area=`: `rh`, `suporte`, `engenharia`, `dev-software`, `eng-dados`, `arquitetura`, `projetos`.
Valores de `&tipo=`: `contratacao`, `desligamento`, `relatorios`, `solicitacao-servico` (RH); `criacao-usuario`, `remocao-usuario`, `solicitacao-servico` (Suporte). As outras áreas só têm `solicitacao-servico`, que é escolhido sozinho.

## Onde mexer

| Para… | Edite |
| --- | --- |
| Trocar as listas de Responsável, Grupo de aprovadores, Aprovadores adicionais, Cliente afetado e as opções da Contratação | `src/forms/lists.ts` |
| Acrescentar ou alterar campos, áreas e tipos | `src/forms/definitions.ts` |
| Mudar a validação | `src/forms/validate.ts` |
| Mudar como a Descrição do RH é montada | `descriptionLayout` em `src/forms/definitions.ts` e `src/forms/ticket.ts` |

Nomes marcados com `(provisório)` em `definitions.ts` (alguns tipos de ticket e de solicitação) não foram vistos nas telas do Jira. Confirme-os antes de ligar o Jira real.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` roda os testes, gera o build e publica `dist/`. Para ativá-lo: faça push na branch `main` e, em *Settings → Pages*, escolha *Source: GitHub Actions*. O site fica em `https://<usuário>.github.io/<repositório>/`.

O site publicado é **público**. Por isso as pessoas e os grupos das listas são fictícios, e nenhum dado ou endereço do Jira real entra no código.

## O que falta para o Jira real

- Uma segunda implementação de `PortalApi` (`src/api/client.ts`) que chame um BFF. O token do Jira fica só no servidor.
- Quem é o solicitante e como ele se autentica (hoje não há login).
- Converter o markdown dos campos de texto para o formato do Jira.
- O Suporte não tem tipo de solicitação: o tipo vai no campo "Suporte: Catálogo de Serviço".
- IDs dos campos personalizados e as listas reais.
