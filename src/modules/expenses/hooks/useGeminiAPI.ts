import {useCallback} from 'react';

// Replace with your actual API key
const GEMINI_API_KEY = 'AIzaSyCwcVwQDnXJewl8zZUH-BCOjgWECk98RTI';

// Set to false to disable API calls and use only fallback parser
const USE_GEMINI_API = true;

// Расширенный список категорий и подкатегорий
export const CATEGORIES = {
  'Еда': [
    'Магаз', 'Рестораны', 'Рынок', 'Кофейня', 'Фастфуд', 'Доставка', 'Кондитерская', 'Кафе', 'Супермаркет', 'Продукты',
  ],
  'Транспорт': [
    'Такси', 'Шеринг', 'Общественный', 'Авиа', 'Метро', 'Автобус', 'Поезд', 'Троллейбус', 'Самокат', 'Велосипед', 'Парковка',
  ],
  'Услуги': [
    'Жилье', 'Комиссии, банки', 'Туризм', 'Парикмахерская', 'Веб сервисы', 'Курсы яхтинга', 'Обустройство дома',
    'Мобильная связь', 'Интернет', 'Страхование', 'Образование', 'Медицина', 'Ремонт', 'Прачечная', 'Уборка',
  ],
  'Всякая всячина': [
    'Одежда/обувь', 'Развлечение', 'Налоги', 'Благотворительность', 'Экскурсия', 'Страховка', 'Техника', 'Новый iphone 13',
    'Подарки', 'Книги', 'Игрушки', 'Хобби', 'Спорт', 'Питомцы', 'Аксессуары', 'Косметика', 'Украшения',
  ],
  'Здоровье': [
    'Аптека', 'Врач', 'Стоматолог', 'Анализы', 'Массаж', 'Фитнес', 'Медстраховка',
  ],
  'Образование': [
    'Курсы', 'Книги', 'Онлайн-обучение', 'Тренинги', 'Школа', 'Университет',
  ],
  'Дом': [
    'Аренда', 'Коммуналка', 'Ремонт', 'Мебель', 'Техника', 'Декор', 'Интернет',
  ],
  'Дети': [
    'Игрушки', 'Одежда', 'Кружки', 'Секция', 'Школа', 'Питание',
  ],
  'Путешествия': [
    'Авиабилеты', 'Отель', 'Экскурсии', 'Трансфер', 'Страховка', 'Питание',
  ],
  'Авто': [
    'Бензин', 'Мойка', 'Шиномонтаж', 'Ремонт', 'Страховка', 'Парковка',
  ],
  'Питомцы': [
    'Корм', 'Ветклиника', 'Игрушки', 'Аксессуары',
  ],
};

export interface ExpenseData {
  amount: number;
  currency: string;
  category: string;
  subcategory: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  paymentMethod?: string;
  quantity?: number;
  unit?: string;
  merchant?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  isRecurring?: boolean;
  notes?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const useGeminiAPI = () => {
  const analyzeExpense = useCallback(
    async (text: string): Promise<ExpenseData> => {
      const getCategoryFromText = (text: string): string => {
        const lowerText = text.toLowerCase();

        if (
          lowerText.includes('еда') ||
          lowerText.includes('обед') ||
          lowerText.includes('ужин') ||
          lowerText.includes('завтрак') ||
          lowerText.includes('кафе') ||
          lowerText.includes('ресторан') ||
          lowerText.includes('food') ||
          lowerText.includes('lunch') ||
          lowerText.includes('dinner') ||
          lowerText.includes('breakfast') ||
          lowerText.includes('cafe') ||
          lowerText.includes('restaurant')
        ) {
          return 'Еда';
        }

        if (
          lowerText.includes('транспорт') ||
          lowerText.includes('такси') ||
          lowerText.includes('метро') ||
          lowerText.includes('автобус') ||
          lowerText.includes('transport') ||
          lowerText.includes('taxi') ||
          lowerText.includes('metro') ||
          lowerText.includes('bus')
        ) {
          return 'Транспорт';
        }

        if (
          lowerText.includes('развлечения') ||
          lowerText.includes('кино') ||
          lowerText.includes('театр') ||
          lowerText.includes('entertainment') ||
          lowerText.includes('cinema') ||
          lowerText.includes('theater')
        ) {
          return 'Всякая всячина';
        }

        if (
          lowerText.includes('покупки') ||
          lowerText.includes('магазин') ||
          lowerText.includes('shopping') ||
          lowerText.includes('store') ||
          lowerText.includes('shop')
        ) {
          return 'Всякая всячина';
        }

        return 'Всякая всячина';
      };

      const getCurrencyFromText = (text: string): string => {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('евро') || lowerText.includes('euro') || lowerText.includes('eur')) {
          return 'EUR';
        }
        if (lowerText.includes('доллар') || lowerText.includes('dollar') || lowerText.includes('usd')) {
          return 'USD';
        }
        if (lowerText.includes('рубл') || lowerText.includes('руб')) {
          return 'RUB';
        }
        if (lowerText.includes('фунт') || lowerText.includes('pound') || lowerText.includes('gbp')) {
          return 'GBP';
        }
        
        return 'EUR'; // default
      };

      const parseExpenseFallback = (text: string): ExpenseData => {
        // Simple regex patterns for common expense formats
        const amountMatch = text.match(
          /(\d+(?:[.,]\d{2})?)\s*(евро|euro|рубл|руб|доллар|dollar|usd|eur)/i,
        );
        const amount = amountMatch
          ? parseFloat(amountMatch[1].replace(',', '.'))
          : 0;

        const category = getCategoryFromText(text);
        const currency = getCurrencyFromText(text);

        return {
          amount,
          currency,
          category,
          subcategory: 'Прочее',
          description: text,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          priority: 'medium',
          isRecurring: false,
        };
      };

      // If API is disabled, use fallback immediately
      if (!USE_GEMINI_API) {
        console.log('Gemini API disabled, using fallback parser');
        return parseExpenseFallback(text);
      }

      try {
        const prompt = `
Analyze this expense text: "${text}"

Return a JSON object with these fields:
{
  "amount": number,
  "currency": string,
  "category": string, // one of: ${Object.keys(CATEGORIES).join(', ')}
  "subcategory": string, // one of: ${Object.values(CATEGORIES).flat().join(', ')}
  "description": string (brief description of the expense),
  "location": string (if mentioned - city, store, restaurant name),
  "date": string (YYYY-MM-DD format, use today if not mentioned),
  "time": string (HH:MM format, use current time if not mentioned),
  "paymentMethod": string (cash, card, mobile, etc. if mentioned),
  "quantity": number (if multiple items mentioned),
  "unit": string (pieces, kg, liters, etc. if mentioned),
  "merchant": string (store/restaurant name if mentioned),
  "tags": array of strings (relevant keywords),
  "priority": string (low, medium, high based on amount and category),
  "isRecurring": boolean (true if it's a subscription or regular expense),
  "notes": string (any additional relevant information)
}

Choose the most appropriate category and subcategory from the lists above.
If you are not sure, pick the closest match.
If a field is not mentioned or unclear, use null or appropriate default values.
`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        console.log('Making request to Gemini API...');

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          console.error('Response status:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        console.log('Gemini API response:', data);
        
        const responseText =
          data.candidates[0]?.content?.parts[0]?.text || '{}';

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const expenseData: ExpenseData = JSON.parse(jsonMatch[0]);

        // Set defaults for missing fields
        return {
          amount: expenseData.amount || 0,
          currency: expenseData.currency || getCurrencyFromText(text),
          category: expenseData.category || getCategoryFromText(text),
          subcategory: expenseData.subcategory || '',
          description: expenseData.description || text,
          location: expenseData.location || undefined,
          date: expenseData.date || new Date().toISOString().split('T')[0],
          time: expenseData.time || new Date().toLocaleTimeString(),
          paymentMethod: expenseData.paymentMethod || undefined,
          quantity: expenseData.quantity || undefined,
          unit: expenseData.unit || undefined,
          merchant: expenseData.merchant || undefined,
          tags: expenseData.tags || [],
          priority: expenseData.priority || 'medium',
          isRecurring: expenseData.isRecurring || false,
          notes: expenseData.notes || undefined,
        };
      } catch (error) {
        console.error('Error analyzing expense:', error);
        
        // Check if it's a timeout or network error
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('Request timeout, using fallback parser');
          } else if (error.message.includes('HeadersTimeoutError')) {
            console.warn('Headers timeout, using fallback parser');
          } else if (error.message.includes('Network request failed')) {
            console.warn('Network error, using fallback parser');
          }
        }
        
        // Fallback parsing for common patterns
        return parseExpenseFallback(text);
      }
    },
    [],
  );

  return {
    analyzeExpense,
  };
};
