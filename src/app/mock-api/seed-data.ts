import { Board } from '../features/boards/models/board.model';
import { Card, ChecklistItem, LabelId } from '../features/boards/models/card.model';
import { Column } from '../features/boards/models/column.model';

export interface KanbanDb {
  boards: Board[];
  columns: Column[];
  cards: Card[];
}

function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function checklist(prefix: string, items: [string, boolean][]): ChecklistItem[] {
  return items.map(([text, done], index) => ({ id: `${prefix}-chk-${index + 1}`, text, done }));
}

interface CardSeed {
  title: string;
  description?: string;
  labels?: LabelId[];
  due?: number;
  assignee?: string;
  checklist?: [string, boolean][];
}

function buildBoard(
  board: Board,
  columns: { key: string; title: string; wipLimit?: number; cards: CardSeed[] }[],
): KanbanDb {
  const db: KanbanDb = { boards: [board], columns: [], cards: [] };
  columns.forEach((columnSeed, columnIndex) => {
    const columnId = `${board.id}-${columnSeed.key}`;
    db.columns.push({
      id: columnId,
      boardId: board.id,
      title: columnSeed.title,
      position: columnIndex,
      wipLimit: columnSeed.wipLimit ?? null,
    });
    columnSeed.cards.forEach((cardSeed, cardIndex) => {
      const cardId = `${columnId}-card-${cardIndex + 1}`;
      db.cards.push({
        id: cardId,
        boardId: board.id,
        columnId,
        position: cardIndex,
        title: cardSeed.title,
        description: cardSeed.description ?? '',
        labels: cardSeed.labels ?? [],
        dueDate: cardSeed.due === undefined ? null : isoDate(cardSeed.due),
        checklist: checklist(cardId, cardSeed.checklist ?? []),
        assignee: cardSeed.assignee ?? null,
        createdAt: board.createdAt,
      });
    });
  });
  return db;
}

/** Demo data shown on the first visit (and after "restore sample data"). */
export function createSeedDb(): KanbanDb {
  const boards = [
    buildBoard(
      {
        id: 'board-lancamento',
        title: 'Lançamento do app',
        color: 'violet',
        createdAt: '2026-07-20T12:00:00.000Z',
      },
      [
        {
          key: 'backlog',
          title: 'Backlog',
          cards: [
            {
              title: 'Modo offline para a lista de tarefas',
              description: 'Investigar Service Worker + IndexedDB para sincronizar depois.',
              labels: ['feature', 'frontend'],
            },
            {
              title: 'Exportar relatórios em CSV',
              labels: ['feature', 'backend'],
              assignee: 'Larissa Mendes',
            },
            { title: 'Revisar textos de onboarding', labels: ['docs'] },
          ],
        },
        {
          key: 'todo',
          title: 'A fazer',
          cards: [
            {
              title: 'Tela de configurações da conta',
              description: 'Alterar nome, e-mail e preferências de notificação.',
              labels: ['feature', 'design'],
              due: 6,
              assignee: 'Bruno Costa',
              checklist: [
                ['Wireframe aprovado', true],
                ['Componentes no Figma', false],
                ['Implementar formulário', false],
              ],
            },
            {
              title: 'Corrigir quebra de layout no Safari',
              labels: ['bug', 'frontend'],
              due: 2,
              assignee: 'Rafael Lima',
            },
          ],
        },
        {
          key: 'doing',
          title: 'Em andamento',
          wipLimit: 3,
          cards: [
            {
              title: 'Integração com gateway de pagamento',
              description:
                'Fluxo de checkout com cartão e Pix. Webhooks precisam ser idempotentes.',
              labels: ['backend', 'urgent'],
              due: 1,
              assignee: 'Ana Souza',
              checklist: [
                ['Criar conta sandbox', true],
                ['Endpoint de criação de cobrança', true],
                ['Tratar webhooks', false],
                ['Testes de ponta a ponta', false],
              ],
            },
            {
              title: 'Notificações push',
              labels: ['feature', 'frontend'],
              due: 9,
              assignee: 'Bruno Costa',
              checklist: [
                ['Permissão do navegador', true],
                ['Inscrição no servidor', false],
              ],
            },
            {
              title: 'Cache de imagens no CDN',
              labels: ['backend'],
              assignee: 'Rafael Lima',
            },
          ],
        },
        {
          key: 'review',
          title: 'Revisão',
          wipLimit: 2,
          cards: [
            {
              title: 'Nova paleta de cores e tema escuro',
              labels: ['design', 'frontend'],
              due: -1,
              assignee: 'Marina Alves',
              checklist: [
                ['Contraste AA validado', true],
                ['Tokens documentados', true],
              ],
            },
          ],
        },
        {
          key: 'done',
          title: 'Concluído',
          cards: [
            {
              title: 'Configurar pipeline de CI',
              labels: ['backend', 'docs'],
              assignee: 'Ana Souza',
              checklist: [
                ['Lint', true],
                ['Testes', true],
                ['Build', true],
              ],
            },
            { title: 'Login com e-mail e senha', labels: ['feature'], assignee: 'Bruno Costa' },
          ],
        },
      ],
    ),
    buildBoard(
      {
        id: 'board-marketing',
        title: 'Marketing do 3º trimestre',
        color: 'amber',
        createdAt: '2026-07-22T12:00:00.000Z',
      },
      [
        {
          key: 'ideas',
          title: 'Ideias',
          cards: [
            { title: 'Série de posts sobre produtividade', labels: ['docs'] },
            { title: 'Webinar com clientes', labels: ['urgent'], due: 14 },
          ],
        },
        {
          key: 'producing',
          title: 'Produzindo',
          wipLimit: 2,
          cards: [
            {
              title: 'Landing page da campanha',
              labels: ['design', 'frontend'],
              due: 4,
              assignee: 'Marina Alves',
              checklist: [
                ['Copy', true],
                ['Layout', false],
              ],
            },
          ],
        },
        {
          key: 'published',
          title: 'Publicado',
          cards: [{ title: 'Newsletter de julho', labels: ['docs'], assignee: 'Larissa Mendes' }],
        },
      ],
    ),
    buildBoard(
      {
        id: 'board-estudos',
        title: 'Estudos',
        color: 'green',
        createdAt: '2026-07-24T12:00:00.000Z',
      },
      [
        {
          key: 'next',
          title: 'Para estudar',
          cards: [
            { title: 'Signals e zoneless no Angular', labels: ['frontend'] },
            { title: 'Testes de efeitos no NgRx', labels: ['frontend', 'docs'] },
          ],
        },
        {
          key: 'studying',
          title: 'Estudando',
          wipLimit: 2,
          cards: [
            {
              title: 'RxJS: operadores de alta ordem',
              description: 'switchMap, concatMap, mergeMap e exhaustMap — quando usar cada um.',
              labels: ['frontend'],
              checklist: [
                ['switchMap', true],
                ['concatMap', true],
                ['mergeMap', false],
                ['exhaustMap', false],
              ],
            },
          ],
        },
        {
          key: 'reviewed',
          title: 'Revisado',
          cards: [{ title: 'CDK Drag and Drop', labels: ['frontend'] }],
        },
      ],
    ),
  ];

  return {
    boards: boards.flatMap((db) => db.boards),
    columns: boards.flatMap((db) => db.columns),
    cards: boards.flatMap((db) => db.cards),
  };
}
