import { AppLang } from '../core/i18n/language';
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

/**
 * Demo data shown on the first visit (and after "restore sample data"), written in the language
 * active at that moment. Afterwards it is user data and is not translated anymore.
 */
export function createSeedDb(lang: AppLang = 'pt-BR'): KanbanDb {
  const tr = (pt: string, en: string) => (lang === 'en' ? en : pt);
  const boards = [
    buildBoard(
      {
        id: 'board-lancamento',
        title: tr('Lançamento do app', 'App launch'),
        color: 'violet',
        createdAt: '2026-07-20T12:00:00.000Z',
      },
      [
        {
          key: 'backlog',
          title: 'Backlog',
          cards: [
            {
              title: tr('Modo offline para a lista de tarefas', 'Offline mode for the task list'),
              description: tr(
                'Investigar Service Worker + IndexedDB para sincronizar depois.',
                'Look into Service Worker + IndexedDB to sync later.',
              ),
              labels: ['feature', 'frontend'],
            },
            {
              title: tr('Exportar relatórios em CSV', 'Export reports as CSV'),
              labels: ['feature', 'backend'],
              assignee: 'Larissa Mendes',
            },
            {
              title: tr('Revisar textos de onboarding', 'Review onboarding copy'),
              labels: ['docs'],
            },
          ],
        },
        {
          key: 'todo',
          title: tr('A fazer', 'To do'),
          cards: [
            {
              title: tr('Tela de configurações da conta', 'Account settings screen'),
              description: tr(
                'Alterar nome, e-mail e preferências de notificação.',
                'Change name, e-mail and notification preferences.',
              ),
              labels: ['feature', 'design'],
              due: 6,
              assignee: 'Bruno Costa',
              checklist: [
                [tr('Wireframe aprovado', 'Wireframe approved'), true],
                [tr('Componentes no Figma', 'Components in Figma'), false],
                [tr('Implementar formulário', 'Build the form'), false],
              ],
            },
            {
              title: tr('Corrigir quebra de layout no Safari', 'Fix layout break on Safari'),
              labels: ['bug', 'frontend'],
              due: 2,
              assignee: 'Rafael Lima',
            },
          ],
        },
        {
          key: 'doing',
          title: tr('Em andamento', 'In progress'),
          wipLimit: 3,
          cards: [
            {
              title: tr('Integração com gateway de pagamento', 'Payment gateway integration'),
              description: tr(
                'Fluxo de checkout com cartão e Pix. Webhooks precisam ser idempotentes.',
                'Checkout flow with card and Pix. Webhooks must be idempotent.',
              ),
              labels: ['backend', 'urgent'],
              due: 1,
              assignee: 'Ana Souza',
              checklist: [
                [tr('Criar conta sandbox', 'Create sandbox account'), true],
                [tr('Endpoint de criação de cobrança', 'Charge creation endpoint'), true],
                [tr('Tratar webhooks', 'Handle webhooks'), false],
                [tr('Testes de ponta a ponta', 'End-to-end tests'), false],
              ],
            },
            {
              title: tr('Notificações push', 'Push notifications'),
              labels: ['feature', 'frontend'],
              due: 9,
              assignee: 'Bruno Costa',
              checklist: [
                [tr('Permissão do navegador', 'Browser permission'), true],
                [tr('Inscrição no servidor', 'Server subscription'), false],
              ],
            },
            {
              title: tr('Cache de imagens no CDN', 'Image caching on the CDN'),
              labels: ['backend'],
              assignee: 'Rafael Lima',
            },
          ],
        },
        {
          key: 'review',
          title: tr('Revisão', 'Review'),
          wipLimit: 2,
          cards: [
            {
              title: tr('Nova paleta de cores e tema escuro', 'New color palette and dark theme'),
              labels: ['design', 'frontend'],
              due: -1,
              assignee: 'Marina Alves',
              checklist: [
                [tr('Contraste AA validado', 'AA contrast checked'), true],
                [tr('Tokens documentados', 'Tokens documented'), true],
              ],
            },
          ],
        },
        {
          key: 'done',
          title: tr('Concluído', 'Done'),
          cards: [
            {
              title: tr('Configurar pipeline de CI', 'Set up the CI pipeline'),
              labels: ['backend', 'docs'],
              assignee: 'Ana Souza',
              checklist: [
                ['Lint', true],
                [tr('Testes', 'Tests'), true],
                ['Build', true],
              ],
            },
            {
              title: tr('Login com e-mail e senha', 'E-mail and password login'),
              labels: ['feature'],
              assignee: 'Bruno Costa',
            },
          ],
        },
      ],
    ),
    buildBoard(
      {
        id: 'board-marketing',
        title: tr('Marketing do 3º trimestre', 'Q3 marketing'),
        color: 'amber',
        createdAt: '2026-07-22T12:00:00.000Z',
      },
      [
        {
          key: 'ideas',
          title: tr('Ideias', 'Ideas'),
          cards: [
            {
              title: tr('Série de posts sobre produtividade', 'Blog series on productivity'),
              labels: ['docs'],
            },
            { title: tr('Webinar com clientes', 'Customer webinar'), labels: ['urgent'], due: 14 },
          ],
        },
        {
          key: 'producing',
          title: tr('Produzindo', 'In production'),
          wipLimit: 2,
          cards: [
            {
              title: tr('Landing page da campanha', 'Campaign landing page'),
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
          title: tr('Publicado', 'Published'),
          cards: [
            {
              title: tr('Newsletter de julho', 'July newsletter'),
              labels: ['docs'],
              assignee: 'Larissa Mendes',
            },
          ],
        },
      ],
    ),
    buildBoard(
      {
        id: 'board-estudos',
        title: tr('Estudos', 'Studies'),
        color: 'green',
        createdAt: '2026-07-24T12:00:00.000Z',
      },
      [
        {
          key: 'next',
          title: tr('Para estudar', 'To study'),
          cards: [
            {
              title: tr('Signals e zoneless no Angular', 'Signals and zoneless in Angular'),
              labels: ['frontend'],
            },
            {
              title: tr('Testes de efeitos no NgRx', 'Testing NgRx effects'),
              labels: ['frontend', 'docs'],
            },
          ],
        },
        {
          key: 'studying',
          title: tr('Estudando', 'Studying'),
          wipLimit: 2,
          cards: [
            {
              title: tr('RxJS: operadores de alta ordem', 'RxJS: higher-order operators'),
              description: tr(
                'switchMap, concatMap, mergeMap e exhaustMap: quando usar cada um.',
                'switchMap, concatMap, mergeMap and exhaustMap: when to use each.',
              ),
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
          title: tr('Revisado', 'Reviewed'),
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
