import {useCallback} from 'react';

// Replace with your actual API key
const GEMINI_API_KEY = 'AIzaSyCwcVwQDnXJewl8zZUH-BCOjgWECk98RTI';

// Set to false to disable API calls and use only fallback parser
const USE_GEMINI_API = true;

export interface ExpenseData {
  amount: number;
  currency: string;
  category: string;
  description: string;
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
          return 'food';
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
          return 'transport';
        }

        if (
          lowerText.includes('развлечения') ||
          lowerText.includes('кино') ||
          lowerText.includes('театр') ||
          lowerText.includes('entertainment') ||
          lowerText.includes('cinema') ||
          lowerText.includes('theater')
        ) {
          return 'entertainment';
        }

        if (
          lowerText.includes('покупки') ||
          lowerText.includes('магазин') ||
          lowerText.includes('shopping') ||
          lowerText.includes('store') ||
          lowerText.includes('shop')
        ) {
          return 'shopping';
        }

        return 'other';
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
        const description = text.trim();

        return {
          amount,
          currency,
          category,
          description,
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
        const prompt = `Analyze this expense text: "${text}"

Extract all possible information and return a JSON object with these fields:
{
  "amount": number (extract monetary amount),
  "currency": string (EUR, USD, RUB, GBP, etc.),
  "category": string (food, transport, entertainment, shopping, health, education, utilities, other),
  "description": string (brief description),
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

If a field is not mentioned or unclear, use null or appropriate default values.`;

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
