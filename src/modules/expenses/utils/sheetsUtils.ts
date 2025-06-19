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

  // Создаем название листа в формате "Месяц Год"
  const monthYear = `${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;

  try {
    // Проверяем существование листа для текущего месяца
    try {
      await getSheetId(accessToken, spreadsheetId, monthYear);
    } catch {
      // Если лист не существует, создаем его
      await createSimpleExpenseSheet(accessToken, spreadsheetId, monthYear);
    }

    // Добавляем новую строку с тратой
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A:F:append?valueInputOption=USER_ENTERED`,
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
    // Сначала получаем список всех листов
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
    const sheets = data.sheets || [];
    
    // Фильтруем только листы с месяцами (формат "Месяц Год")
    const monthSheets = sheets.filter((sheet: any) => {
      const title = sheet.properties.title;
      // Проверяем, что название соответствует формату "Месяц Год"
      return /^[а-яё]+ \d{4}$/i.test(title);
    });

    const allExpenses: Expense[] = [];

    // Загружаем данные из каждого месячного листа
    for (const sheet of monthSheets) {
      const sheetTitle = sheet.properties.title;
      try {
        const sheetResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!A:F`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (sheetResponse.ok) {
          const sheetData = await sheetResponse.json();
          const rows = sheetData.values || [];

          // Пропускаем заголовок
          const expenseRows = rows.slice(1);

          const sheetExpenses = expenseRows.map((row: any[], index: number) => {
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
              id: `${sheetTitle}-${index}`,
              timestamp,
              category: category || 'Другое',
              description: description || '',
              amount: parseFloat(amountStr || '0'),
              currency: currency || 'RUB',
            };
          });

          allExpenses.push(...sheetExpenses);
        }
      } catch (error) {
        console.warn(`Ошибка загрузки листа ${sheetTitle}:`, error);
      }
    }

    return allExpenses;
  } catch (error) {
    console.error('Ошибка при загрузке трат из таблицы:', error);
    return [];
  }
};

export const clearSheetData = async (
  accessToken: string,
  spreadsheetId: string
) => {
  try {
    // Получаем список всех листов
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
    const sheets = data.sheets || [];
    
    // Фильтруем только листы с месяцами (формат "Месяц Год")
    const monthSheets = sheets.filter((sheet: any) => {
      const title = sheet.properties.title;
      return /^[а-яё]+ \d{4}$/i.test(title);
    });

    // Очищаем данные из каждого месячного листа, оставляя заголовки
    for (const sheet of monthSheets) {
      const sheetTitle = sheet.properties.title;
      try {
        // Очищаем все данные кроме заголовка (первая строка)
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!A2:F1000:clear`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
      } catch (error) {
        console.warn(`Ошибка очистки листа ${sheetTitle}:`, error);
      }
    }

    console.log('Все данные из листов успешно очищены');
  } catch (error) {
    console.error('Ошибка при очистке данных из таблицы:', error);
    throw error;
  }
}; 