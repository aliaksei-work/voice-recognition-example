import { Expense } from '../hooks/useExpenses';

const HEADERS = [
  'Дата',
  'Время', 
  'Категория',
  'Описание',
  'Сумма',
  'Валюта',
];

const COLORS = {
  header: { red: 0.27, green: 0.35, blue: 0.39 },
  headerText: { red: 1, green: 1, blue: 1 },
};

export const createSimpleExpenseSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string = 'Расходы'
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
      const errorText = await addSheetResponse.text();
      let errorJson: any = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {}
      if (
        errorJson?.error?.status === 'ALREADY_EXISTS' ||
        (typeof errorText === 'string' && errorText.includes('уже существует'))
      ) {
        return;
      }
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
  const formattedDate = date.toLocaleDateString('ru-RU');
  const formattedTime = date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  try {
    // Проверяем существование листа
    try {
      await getSheetId(accessToken, spreadsheetId, 'Расходы');
    } catch {
      // Если лист не существует, создаем его
      await createSimpleExpenseSheet(accessToken, spreadsheetId, 'Расходы');
    }

    // Добавляем новую строку с тратой
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Расходы!A:F:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[
            formattedDate,
            formattedTime,
            expense.category || 'Другое',
            expense.description || '',
            expense.amount.toString(),
            expense.currency || 'RUB',
          ]],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Ошибка добавления траты: ' + errorText);
    }

    console.log('Трата успешно добавлена в таблицу');
  } catch (error) {
    console.error('Ошибка при добавлении траты в таблицу:', error);
    throw error;
  }
};

export const loadExpensesFromSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<Expense[]> => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Расходы!A:F`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Ошибка загрузки данных из таблицы');
    }

    const data = await response.json();
    const rows = data.values || [];

    // Пропускаем заголовок
    const expenseRows = rows.slice(1);

    return expenseRows.map((row: any[], index: number) => {
      const [dateStr, timeStr, category, description, amountStr, currency] = row;
      
      // Парсим дату и время
      const [day, month, year] = (dateStr || '').split('.');
      const [hours, minutes] = (timeStr || '').split(':');
      
      const timestamp = new Date(
        parseInt(year || new Date().getFullYear().toString()),
        parseInt(month || '1') - 1,
        parseInt(day || '1'),
        parseInt(hours || '0'),
        parseInt(minutes || '0')
      ).getTime();

      return {
        id: `sheet-${index}`,
        timestamp,
        category: category || 'Другое',
        description: description || '',
        amount: parseFloat(amountStr || '0'),
        currency: currency || 'RUB',
      };
    });
  } catch (error) {
    console.error('Ошибка при загрузке трат из таблицы:', error);
    return [];
  }
}; 