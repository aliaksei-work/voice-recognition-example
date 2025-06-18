import { Expense } from '../hooks/useExpenses';
import { CATEGORIES as RAW_CATEGORIES } from '../hooks/useGeminiAPI';

// Добавляем index signature для CATEGORIES
export const CATEGORIES: Record<string, string[]> = RAW_CATEGORIES as Record<string, string[]>;

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

// MONTH_TEMPLATE теперь строится на основе CATEGORIES
export const MONTH_TEMPLATE = Object.keys(CATEGORIES).map((category, i) => ({
  category,
  subcategories: CATEGORIES[category],
  color: { red: 1, green: 0.6, blue: 0 },
  col: i * 3,
}));

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
                    columnCount: 40,
                  },
                },
              },
            },
          ],
        }),
      }
    );

    if (!addSheetResponse.ok) {
      const errorText = await addSheetResponse.text();
      // Пробуем распарсить ошибку
      let errorJson: any = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {}
      // Если ошибка ALREADY_EXISTS — просто продолжаем (лист уже есть)
      if (
        errorJson?.error?.status === 'ALREADY_EXISTS' ||
        (typeof errorText === 'string' && errorText.includes('уже существует'))
      ) {
        return;
      }
      // Иначе выбрасываем подробную ошибку
      throw new Error('Ошибка при создании листа: ' + (errorJson?.error?.message || errorText));
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
            expense.subcategory,
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
                    values: [
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                      { userEnteredFormat: { backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 } } },
                    ],
                  },
                ],
                fields: 'userEnteredFormat',
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 10,
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

  // Добавляем заголовок "Расходы за месяц"
  requests.push({
    updateCells: {
      rows: [
        {
          values: [
            {
              userEnteredValue: { stringValue: `Расходы за ${sheetTitle}` },
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.3, blue: 0.8 },
                textFormat: { bold: true, fontSize: 16, foregroundColor: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
          ],
        },
      ],
      fields: 'userEnteredValue,userEnteredFormat',
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
    },
  });

  // Оранжевая шапка с категориями
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
                  textFormat: { bold: true, fontSize: 13, foregroundColor: { red: 0, green: 0, blue: 0 } },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              },
              { 
                userEnteredValue: { stringValue: '∑' }, 
                userEnteredFormat: { 
                  backgroundColor: cat.color, 
                  textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } }, 
                  horizontalAlignment: 'CENTER' 
                } 
              },
            ],
          },
        ],
        fields: 'userEnteredValue,userEnteredFormat',
        range: {
          sheetId,
          startRowIndex: 2,
          endRowIndex: 3,
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
                { 
                  userEnteredValue: { stringValue: subcat }, 
                  userEnteredFormat: { 
                    backgroundColor: { red: 0.9, green: 1, blue: 0.9 },
                    textFormat: { fontSize: 11, foregroundColor: { red: 0, green: 0, blue: 0 } }
                  } 
                },
                { 
                  userEnteredValue: { numberValue: 0 }, 
                  userEnteredFormat: { 
                    backgroundColor: { red: 0.8, green: 0.95, blue: 0.8 },
                    textFormat: { fontSize: 11, foregroundColor: { red: 0, green: 0, blue: 0 } }
                  } 
                },
              ],
            },
          ],
          fields: 'userEnteredValue,userEnteredFormat',
          range: {
            sheetId,
            startRowIndex: 3 + idx,
            endRowIndex: 4 + idx,
            startColumnIndex: cat.col,
            endColumnIndex: cat.col + 2,
          },
        },
      });
    });
  });

  // Итоги по категориям (формулы)
  MONTH_TEMPLATE.forEach((cat) => {
    const end = 3 + cat.subcategories.length;
    const range = String.fromCharCode(66 + cat.col) + '4:' + String.fromCharCode(66 + cat.col) + (end + 1);
    requests.push({
      updateCells: {
        rows: [
          {
            values: [
              { 
                userEnteredValue: { stringValue: '' }, 
                userEnteredFormat: { backgroundColor: cat.color } 
              },
              { 
                userEnteredValue: { formulaValue: `=SUM(${range})` }, 
                userEnteredFormat: { 
                  backgroundColor: cat.color, 
                  textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } } 
                } 
              },
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
  const maxRow = Math.max(...MONTH_TEMPLATE.map(cat => 4 + cat.subcategories.length)) + 2;
  requests.push({
    updateCells: {
      rows: [
        {
          values: [
            { 
              userEnteredValue: { stringValue: 'Всего € :' }, 
              userEnteredFormat: { 
                backgroundColor: { red: 0.6, green: 0.5, blue: 1 }, 
                textFormat: { bold: true, fontSize: 14, foregroundColor: { red: 0, green: 0, blue: 0 } } 
              } 
            },
            { 
              userEnteredValue: { formulaValue: `=SUM(B${maxRow},E${maxRow},H${maxRow},K${maxRow},N${maxRow},Q${maxRow},T${maxRow},W${maxRow},Z${maxRow},AC${maxRow},AF${maxRow})` }, 
              userEnteredFormat: { 
                backgroundColor: { red: 0.6, green: 0.5, blue: 1 }, 
                textFormat: { bold: true, fontSize: 14, foregroundColor: { red: 0, green: 0, blue: 0 } } 
              } 
            },
          ],
        },
      ],
      fields: 'userEnteredValue,userEnteredFormat',
      range: {
        sheetId,
        startRowIndex: maxRow as number,
        endRowIndex: (maxRow as number) + 1,
        startColumnIndex: 0,
        endColumnIndex: 2,
      },
    },
  });

  // Устанавливаем ширину столбцов
  requests.push({
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: 0,
        endIndex: 40,
      },
      properties: {
        pixelSize: 100,
      },
      fields: 'pixelSize',
    },
  });

  // Отправить batchUpdate
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Ошибка при создании шаблона листа: ' + errorText);
  }
};

// Получить координаты ячейки для категории/подкатегории (без учёта регистра и пробелов)
export function getCellForCategorySubcategory(category: string, subcategory: string) {
  const norm = (s: string) => (s ? s.trim().toLowerCase() : '');
  const cat = MONTH_TEMPLATE.find(c => norm(c.category) === norm(category));
  if (!cat) return null;
  const subIdx = cat.subcategories.findIndex(s => norm(s) === norm(subcategory));
  if (subIdx === -1) return null;
  const row = 3 + subIdx;
  const col = cat.col + 1;
  return { row, col };
}

// Преобразование индекса столбца в буквы Google Sheets (A, B, ..., Z, AA, AB, ...)
function columnToLetter(col: number): string {
  let temp: number;
  let letter = '';
  let colNum = col + 1; // 1-based
  while (colNum > 0) {
    temp = (colNum - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colNum = Math.floor((colNum - 1) / 26);
  }
  return letter;
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
  console.log('[updateExpenseCellInSheet] category:', category, 'subcategory:', subcategory, 'cell:', cell);
  if (!cell) {
    console.error('[updateExpenseCellInSheet] Не найдена ячейка для', category, subcategory);
    throw new Error('Категория или подкатегория не найдена в шаблоне');
  }
  // const sheetId = await getSheetId(accessToken, spreadsheetId, sheetTitle); // больше не нужен
  const colLetter = columnToLetter(cell.col); // A, B, ..., Z, AA, AB, ...
  const cellRef = `${colLetter}${cell.row + 1}`;
  console.log('[updateExpenseCellInSheet] cellRef:', cellRef);

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
  console.log('[updateExpenseCellInSheet] current value:', current, 'amount to add:', amount);

  // Прибавить сумму
  const newValue = current + amount;
  console.log('[updateExpenseCellInSheet] new value:', newValue);

  // Записать новое значение
  const putResp = await fetch(
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
  const putText = await putResp.text();
  console.log('[updateExpenseCellInSheet] put response:', putText);
}

// Нормализация категории и подкатегории (поиск ближайшего совпадения)
export function normalizeCategoryAndSubcategory(category: string, subcategory: string) {
  // Логируем исходные значения
  console.log('[normalizeCategoryAndSubcategory] input:', category, subcategory);
  // Привести к нижнему регистру и убрать пробелы
  const norm = (s: string) => (s ? s.trim().toLowerCase() : '');
  let bestCategory = '';
  let bestSubcategory = '';

  // Если category пустая — берём первую из шаблона
  if (!category || norm(category) === '') {
    bestCategory = Object.keys(CATEGORIES)[0];
  } else {
    // Найти категорию
    for (const cat of Object.keys(CATEGORIES)) {
      if (norm(cat) === norm(category)) {
        bestCategory = cat;
        break;
      }
    }
    if (!bestCategory) {
      // Поиск по вхождению
      for (const cat of Object.keys(CATEGORIES)) {
        if (norm(category).includes(norm(cat)) || norm(cat).includes(norm(category))) {
          bestCategory = cat;
          break;
        }
      }
    }
    if (!bestCategory) {
      bestCategory = Object.keys(CATEGORIES)[0];
    }
  }

  // Если subcategory пустая — берём первую из категории
  const subcats = CATEGORIES[bestCategory];
  if (!subcategory || norm(subcategory) === '') {
    bestSubcategory = subcats[0];
  } else {
    // Найти подкатегорию
    for (const sub of subcats) {
      if (norm(sub) === norm(subcategory)) {
        bestSubcategory = sub;
        break;
      }
    }
    if (!bestSubcategory) {
      // Поиск по вхождению
      for (const sub of subcats) {
        if (norm(subcategory).includes(norm(sub)) || norm(sub).includes(norm(subcategory))) {
          bestSubcategory = sub;
          break;
        }
      }
    }
    if (!bestSubcategory) {
      bestSubcategory = subcats[0];
    }
  }

  console.log('[normalizeCategoryAndSubcategory] result:', bestCategory, bestSubcategory);
  return { category: bestCategory, subcategory: bestSubcategory };
} 