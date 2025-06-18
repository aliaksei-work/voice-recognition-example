import { Expense } from '../hooks/useExpenses';

const HEADERS = [
  'Дата',
  'Время',
  'Категория',
  'Описание',
  'Сумма',
  'Валюта',
  'Способ оплаты',
  'Место',
  'Теги',
  'Приоритет',
];

interface SheetStyle {
  backgroundColor: { red: number; green: number; blue: number };
  textFormat?: {
    bold?: boolean;
    fontSize?: number;
  };
}

const COLORS = {
  header: { red: 0.27, green: 0.35, blue: 0.39 },
  headerText: { red: 1, green: 1, blue: 1 },
  food: { red: 0.85, green: 0.92, blue: 0.827 },
  transport: { red: 0.827, green: 0.91, blue: 0.965 },
  entertainment: { red: 0.976, green: 0.873, blue: 0.976 },
  shopping: { red: 0.976, green: 0.949, blue: 0.831 },
  health: { red: 1, green: 0.851, blue: 0.851 },
  education: { red: 0.851, green: 0.851, blue: 1 },
  utilities: { red: 0.937, green: 0.937, blue: 0.937 },
  other: { red: 0.95, green: 0.95, blue: 0.95 },
};

const getCategoryColor = (category: string): SheetStyle['backgroundColor'] => {
  const categoryColors: { [key: string]: SheetStyle['backgroundColor'] } = {
    food: COLORS.food,
    transport: COLORS.transport,
    entertainment: COLORS.entertainment,
    shopping: COLORS.shopping,
    health: COLORS.health,
    education: COLORS.education,
    utilities: COLORS.utilities,
  };
  return categoryColors[category.toLowerCase()] || COLORS.other;
};

// Категории и подкатегории по примеру скрина
const MONTH_TEMPLATE = [
  {
    category: 'Еда',
    subcategories: ['Магаз', 'Рестораны', 'Рынок'],
    color: { red: 1, green: 0.6, blue: 0 },
    col: 0,
  },
  {
    category: 'Транспорт',
    subcategories: ['Такси', 'Шеринг', 'Общественный', 'Авиа'],
    color: { red: 1, green: 0.6, blue: 0 },
    col: 3,
  },
  {
    category: 'Услуги',
    subcategories: [
      'Жилье',
      'Комиссии, банки',
      'Туризм',
      'Парикмахерская',
      'Веб сервисы',
      'Курсы яхтинга',
      'Обустройство дома',
    ],
    color: { red: 1, green: 0.6, blue: 0 },
    col: 6,
  },
  {
    category: 'Всякая всячина',
    subcategories: [
      'Одежда/обувь',
      'Развлечение',
      'Налоги',
      'Благотворительность',
      'Экскурсия',
      'Страховка',
      'Техника',
      'Новый iphone 13',
    ],
    color: { red: 1, green: 0.6, blue: 0 },
    col: 9,
  },
];

export const createMonthSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
) => {
  try {
    // Создаем новый лист
    const addSheetResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: HEADERS.length,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (!addSheetResponse.ok) {
      throw new Error('Ошибка создания листа');
    }

    // Добавляем заголовки и форматирование
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            // Добавляем заголовки
            {
              updateCells: {
                rows: [
                  {
                    values: HEADERS.map(header => ({
                      userEnteredValue: { stringValue: header },
                      userEnteredFormat: {
                        backgroundColor: COLORS.header,
                        textFormat: {
                          foregroundColor: COLORS.headerText,
                          bold: true,
                          fontSize: 11,
                        },
                        horizontalAlignment: 'CENTER',
                        verticalAlignment: 'MIDDLE',
                      },
                    })),
                  },
                ],
                fields: 'userEnteredValue,userEnteredFormat',
                range: {
                  sheetId: await getSheetId(accessToken, spreadsheetId, sheetTitle),
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: HEADERS.length,
                },
              },
            },
            // Устанавливаем ширину столбцов
            {
              updateDimensionProperties: {
                range: {
                  sheetId: await getSheetId(accessToken, spreadsheetId, sheetTitle),
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: HEADERS.length,
                },
                properties: {
                  pixelSize: 120,
                },
                fields: 'pixelSize',
              },
            },
          ],
        }),
      }
    );
  } catch (error) {
    console.error('Ошибка при создании листа:', error);
    throw error;
  }
};

export const getSheetId = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
): Promise<number> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Ошибка получения информации о таблице');
  }

  const data = await response.json();
  const sheet = data.sheets.find(
    (s: any) => s.properties.title === sheetTitle
  );
  
  if (!sheet) {
    throw new Error(`Лист ${sheetTitle} не найден`);
  }

  return sheet.properties.sheetId;
};

export const appendExpenseToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  expense: Expense
) => {
  const date = new Date(expense.timestamp);
  const monthYear = `${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;
  
  try {
    // Проверяем существование листа для текущего месяца
    try {
      await getSheetId(accessToken, spreadsheetId, monthYear);
    } catch {
      // Если лист не существует, создаем новый
      await createMonthSheet(accessToken, spreadsheetId, monthYear);
    }

    // Добавляем данные
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A1:J1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[
            expense.date || new Date(expense.timestamp).toLocaleDateString('ru'),
            expense.time || new Date(expense.timestamp).toLocaleTimeString('ru'),
            expense.category,
            expense.description,
            expense.amount,
            expense.currency,
            expense.paymentMethod || '',
            expense.location || '',
            (expense.tags || []).join(', '),
            expense.priority || 'medium',
          ]],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Ошибка добавления данных');
    }

    // Форматируем добавленную строку
    const sheetId = await getSheetId(accessToken, spreadsheetId, monthYear);
    const rowIndex = (await response.json()).updates.updatedRange.match(/\d+/)[0] - 1;

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateCells: {
                rows: [
                  {
                    values: Array(HEADERS.length).fill({
                      userEnteredFormat: {
                        backgroundColor: getCategoryColor(expense.category),
                        textFormat: { fontSize: 10 },
                        borders: {
                          bottom: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
                          right: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } },
                        },
                      },
                    }),
                  },
                ],
                fields: 'userEnteredFormat',
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: HEADERS.length,
                },
              },
            },
          ],
        }),
      }
    );
  } catch (error) {
    console.error('Ошибка при добавлении расхода в таблицу:', error);
    throw error;
  }
};

// Функция для генерации шаблона листа месяца
export const createMonthSheetTemplate = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
) => {
  // 1. Создать лист
  await createMonthSheet(accessToken, spreadsheetId, sheetTitle);

  // Получаем sheetId один раз
  const sheetId = await getSheetId(accessToken, spreadsheetId, sheetTitle);

  // 2. Подготовить batchUpdate для структуры, цветов и формул
  const requests: any[] = [];

  // Оранжевая шапка
  MONTH_TEMPLATE.forEach((cat) => {
    requests.push({
      updateCells: {
        rows: [
          {
            values: [
              {
                userEnteredValue: { stringValue: `${cat.category} €` },
                userEnteredFormat: {
                  backgroundColor: cat.color,
                  textFormat: { bold: true, fontSize: 13 },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              },
              { userEnteredValue: { stringValue: '∑' }, userEnteredFormat: { backgroundColor: cat.color, textFormat: { bold: true }, horizontalAlignment: 'CENTER' } },
            ],
          },
        ],
        fields: 'userEnteredValue,userEnteredFormat',
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: cat.col,
          endColumnIndex: cat.col + 2,
        },
      },
    });
  });

  // Подкатегории и суммы
  MONTH_TEMPLATE.forEach((cat) => {
    cat.subcategories.forEach((subcat, idx) => {
      requests.push({
        updateCells: {
          rows: [
            {
              values: [
                { userEnteredValue: { stringValue: subcat }, userEnteredFormat: { backgroundColor: { red: 0.9, green: 1, blue: 0.9 } } },
                { userEnteredValue: { numberValue: 0 }, userEnteredFormat: { backgroundColor: { red: 0.8, green: 0.95, blue: 0.8 } } },
              ],
            },
          ],
          fields: 'userEnteredValue,userEnteredFormat',
          range: {
            sheetId,
            startRowIndex: 2 + idx,
            endRowIndex: 3 + idx,
            startColumnIndex: cat.col,
            endColumnIndex: cat.col + 2,
          },
        },
      });
    });
  });

  // Итоги по категориям (формулы)
  MONTH_TEMPLATE.forEach((cat) => {
    const end = 2 + cat.subcategories.length;
    const range = String.fromCharCode(66 + cat.col) + '3:' + String.fromCharCode(66 + cat.col) + (end + 1);
    requests.push({
      updateCells: {
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: '' }, userEnteredFormat: { backgroundColor: cat.color } },
              { userEnteredValue: { formulaValue: `=SUM(${range})` }, userEnteredFormat: { backgroundColor: cat.color, textFormat: { bold: true } } },
            ],
          },
        ],
        fields: 'userEnteredValue,userEnteredFormat',
        range: {
          sheetId,
          startRowIndex: end + 1,
          endRowIndex: end + 2,
          startColumnIndex: cat.col,
          endColumnIndex: cat.col + 2,
        },
      },
    });
  });

  // Общий итог (фиолетовая строка)
  requests.push({
    updateCells: {
      rows: [
        {
          values: [
            { userEnteredValue: { stringValue: 'Всего € :' }, userEnteredFormat: { backgroundColor: { red: 0.6, green: 0.5, blue: 1 }, textFormat: { bold: true, fontSize: 14 } } },
            { userEnteredValue: { formulaValue: '=SUM(B12,E12,H12,K12)' }, userEnteredFormat: { backgroundColor: { red: 0.6, green: 0.5, blue: 1 }, textFormat: { bold: true, fontSize: 14 } } },
          ],
        },
      ],
      fields: 'userEnteredValue,userEnteredFormat',
      range: {
        sheetId,
        startRowIndex: 11,
        endRowIndex: 12,
        startColumnIndex: 0,
        endColumnIndex: 2,
      },
    },
  });

  // Отправить batchUpdate
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
};

// Получить координаты ячейки для категории/подкатегории
export function getCellForCategorySubcategory(category: string, subcategory: string) {
  const cat = MONTH_TEMPLATE.find(c => c.category === category);
  if (!cat) return null;
  const row = 2 + cat.subcategories.findIndex(s => s === subcategory);
  if (row < 2) return null;
  const col = cat.col + 1; // сумма всегда во второй колонке блока
  return { row, col };
}

// Обновить сумму в ячейке (категория/подкатегория)
export async function updateExpenseCellInSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  category: string,
  subcategory: string,
  amount: number
) {
  // Получить координаты ячейки
  const cell = getCellForCategorySubcategory(category, subcategory);
  if (!cell) throw new Error('Категория или подкатегория не найдена в шаблоне');
  // const sheetId = await getSheetId(accessToken, spreadsheetId, sheetTitle); // больше не нужен
  const colLetter = String.fromCharCode(65 + cell.col); // A=0, B=1, ...
  const cellRef = `${colLetter}${cell.row + 1}`;

  // Прочитать текущее значение
  const getResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!${cellRef}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  let current = 0;
  if (getResp.ok) {
    const data = await getResp.json();
    if (data.values && data.values[0] && data.values[0][0]) {
      current = parseFloat(data.values[0][0].toString().replace(',', '.')) || 0;
    }
  }

  // Прибавить сумму
  const newValue = current + amount;

  // Записать новое значение
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!${cellRef}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [[newValue]] }),
    }
  );
} 