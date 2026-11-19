// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { incidente, mudanca } from '../forms/definitions';
import FormPage from './FormPage';
import ProblemPage from './ProblemPage';
import RequestPage from './RequestPage';

beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(cleanup);

const requestPage = (url: string) =>
  render(<MemoryRouter initialEntries={[url]}><RequestPage /></MemoryRouter>);

/** Abre um select pelo id do botão e escolhe a opção pelo texto. */
async function pick(user: ReturnType<typeof userEvent.setup>, selectId: string, option: string) {
  await user.click(document.getElementById(selectId)!);
  await user.click(await screen.findByRole('option', { name: option }));
}

const field = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement;

describe('Incidente', () => {
  it('mostra os erros, foca o primeiro campo inválido e só envia depois de preenchido', async () => {
    const user = userEvent.setup();
    render(<FormPage form={incidente} />);

    await user.click(screen.getByRole('button', { name: 'Criar' }));
    expect(screen.getByText('Preencha o campo resumo.')).toBeTruthy();
    expect(screen.getByText('Preencha o campo descrição.')).toBeTruthy();
    expect(document.activeElement).toBe(field(/^Resumo/));

    await user.type(field(/^Resumo/), 'Sistema fora do ar');
    expect(screen.queryByText('Preencha o campo resumo.')).toBeNull(); // o erro some ao digitar
    await user.type(field(/^Descrição/), 'Desde as 9h');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText(/REP-\d+/, {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sistema fora do ar' })).toBeTruthy();
    expect(screen.getByText(/nada foi enviado ao Jira/)).toBeTruthy();
    expect(screen.getAllByText('Incidente Interno')).toHaveLength(2); // tipo do ticket e tipo de solicitação
    expect(screen.queryByRole('link', { name: /Ver no Jira/ })).toBeNull();
  });

  it('"Criar outro" volta ao formulário em branco', async () => {
    const user = userEvent.setup();
    render(<FormPage form={incidente} />);
    await user.type(field(/^Resumo/), 'Um');
    await user.type(field(/^Descrição/), 'Dois');
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    await user.click(await screen.findByRole('button', { name: 'Criar outro' }, { timeout: 3000 }));
    expect(field(/^Resumo/).value).toBe('');
    expect(field(/^Descrição/).value).toBe('');
  });
});

describe('Requisição', () => {
  it('sem parâmetros: só os selects, sem formulário nem botão Criar', () => {
    requestPage('/requisicao');
    expect(document.getElementById('f-area')).toBeTruthy();
    expect((document.getElementById('f-tipo') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Criar' })).toBeNull();
    expect(screen.queryByLabelText(/^Resumo/)).toBeNull();
  });

  it('?area=suporte&tipo=criacao-usuario já abre o formulário certo', () => {
    requestPage('/requisicao?area=suporte&tipo=criacao-usuario');
    expect(within(document.getElementById('f-area')!).getByText('Suporte')).toBeTruthy();
    expect(within(document.getElementById('f-tipo')!).getByText('Criação de Usuário')).toBeTruthy();
    expect(field(/^Resumo/)).toBeTruthy();
    expect(field(/^Descrição/)).toBeTruthy();
  });

  it('?area=rh sem tipo pede o tipo; ao escolher Contratação aparecem os 12 campos do modelo', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao?area=rh');
    expect(screen.queryByRole('button', { name: 'Criar' })).toBeNull();
    await pick(user, 'f-tipo', 'Contratação');
    for (const label of [/^Gestor responsável/, /^Cargo a ser ocupado/, /^Faixa salarial/, /^Data prevista de início/]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.queryByLabelText(/^Descrição/)).toBeNull(); // a Descrição é montada pelo portal
    expect(screen.getAllByText('*').length).toBeGreaterThan(10);
  });

  it('área com um único tipo (Engenharia) escolhe "Solicitação de Serviço" sozinha', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao');
    await pick(user, 'f-area', 'Engenharia');
    expect(within(document.getElementById('f-tipo')!).getByText('Solicitação de Serviço')).toBeTruthy();
    expect(field(/^Resumo/)).toBeTruthy();
  });

  it('ao trocar de tipo, só o Resumo é preservado', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao?area=rh&tipo=contratacao');
    await user.type(field(/^Resumo/), 'Vaga de dados');
    await user.type(field(/^Cargo a ser ocupado/), 'Analista');

    await pick(user, 'f-tipo', 'Desligamento');
    expect(field(/^Resumo/).value).toBe('Vaga de dados');
    expect(screen.getByLabelText(/^Nome do membro/)).toBeTruthy();
    expect(screen.queryByLabelText(/^Cargo a ser ocupado/)).toBeNull();

    await pick(user, 'f-tipo', 'Contratação');
    expect((screen.getByLabelText(/^Cargo a ser ocupado/) as HTMLInputElement).value).toBe(''); // zerado
  });

  it('trocar de Área limpa o tipo e esconde o formulário', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao?area=rh&tipo=contratacao');
    await pick(user, 'f-area', 'Suporte');
    expect(screen.queryByRole('button', { name: 'Criar' })).toBeNull();
    expect(within(document.getElementById('f-tipo')!).getByText('Selecione o tipo')).toBeTruthy();
  });

  it('envia a Contratação e mostra a confirmação com os valores legíveis', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao?area=rh&tipo=contratacao');
    await user.type(field(/^Resumo/), 'Analista de dados');
    await user.type(field(/^Gestor responsável/), 'Maria');
    await user.type(field(/^Cargo a ser ocupado/), 'Analista');
    await pick(user, 'f-tipo-posicao', 'Nova posição');
    await pick(user, 'f-regime', 'CLT');
    await user.type(field(/^Faixa salarial/), '8 a 10 mil');
    await user.type(field(/^Centro de custo/), '1020');
    await pick(user, 'f-escolaridade', 'Graduação');
    await user.type(field(/^Principais atividades/), 'Modelar dados');
    await pick(user, 'f-acesso-informacao', 'Interno');
    await user.type(field(/^Data prevista de início/), '2027-02-01');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText(/REP-\d+/, {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByText('Requisição Interna - RH')).toBeTruthy();
    expect(screen.getByText('RH: Requisição de Contratação')).toBeTruthy();
    expect(screen.getByText('01/02/2027')).toBeTruthy();
    expect(screen.getByText('Nova posição')).toBeTruthy();
  });

  it('"Criar outro" mantém Área e Tipo escolhidos', async () => {
    const user = userEvent.setup();
    requestPage('/requisicao?area=suporte&tipo=remocao-usuario');
    await user.type(field(/^Resumo/), 'Remover João');
    await user.type(field(/^Descrição/), 'Saiu da empresa');
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    await user.click(await screen.findByRole('button', { name: 'Criar outro' }, { timeout: 3000 }));
    expect(within(document.getElementById('f-tipo')!).getByText('Remoção de Usuário')).toBeTruthy();
    expect(field(/^Resumo/).value).toBe('');
  });
});

describe('Mudança', () => {
  it('mostra os 16 campos, inclusive Responsável com "Automático", e o plano com o cabeçalho', () => {
    render(<FormPage form={mudanca} />);
    expect(mudanca.fields).toHaveLength(16);
    for (const f of mudanca.fields) expect(document.getElementById(`f-${f.id}`), f.id).toBeTruthy();
    expect(within(document.getElementById('f-responsavel')!).getByText('Automático')).toBeTruthy();
    expect(field(/^Plano de implementação/).value).toBe('Data | Hora | Descrição da ação');
  });

  it('"Atribuir a mim" seleciona o usuário simulado', async () => {
    const user = userEvent.setup();
    render(<FormPage form={mudanca} />);
    await user.click(screen.getByRole('button', { name: 'Atribuir a mim' }));
    expect(within(document.getElementById('f-responsavel')!).getByText('Pessoa Demonstração')).toBeTruthy();
  });

  it('o envio em branco lista os campos obrigatórios e foca o primeiro (Tipo de mudança)', async () => {
    const user = userEvent.setup();
    render(<FormPage form={mudanca} />);
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    expect(screen.getByText('Selecione tipo de mudança.')).toBeTruthy();
    expect(screen.getByText(/Adicione ao menos uma linha em plano de implementação/)).toBeTruthy();
    expect(document.activeElement).toBe(document.getElementById('f-tipo-mudanca'));
    expect(screen.queryByText(/aprovadores adicionais/i, { selector: '.wz-error' })).toBeNull(); // opcional
  });

  it('seleção múltipla de Aprovadores adicionais marca e desmarca', async () => {
    const user = userEvent.setup();
    render(<FormPage form={mudanca} />);
    const box = document.getElementById('f-aprovadores-adicionais')!;
    await user.click(box);
    await user.click(await screen.findByRole('option', { name: 'Ana Souza' }));
    await user.click(screen.getByRole('option', { name: 'Bruno Lima' }));
    expect(box.textContent).toBe('Ana Souza, Bruno Lima');
    await user.click(screen.getByRole('option', { name: 'Ana Souza' }));
    expect(box.textContent).toBe('Bruno Lima');
  });
});

describe('Problema', () => {
  it('é um placeholder com aviso e link para o Incidente', () => {
    render(<MemoryRouter><ProblemPage /></MemoryRouter>);
    expect(screen.getByText('Esta tela ainda será definida.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Relatar um Incidente' }).getAttribute('href')).toBe('/incidente');
    expect(screen.queryByRole('button', { name: 'Criar' })).toBeNull();
  });
});

describe('toolbar do editor', () => {
  it('o botão de negrito envolve o texto selecionado', async () => {
    const user = userEvent.setup();
    render(<FormPage form={incidente} />);
    const desc = field(/^Descrição/);
    await user.type(desc, 'importante');
    desc.setSelectionRange(0, 10);
    await user.click(screen.getByRole('button', { name: 'Negrito' }));
    await waitFor(() => expect(desc.value).toBe('**importante**'));
  });
});
