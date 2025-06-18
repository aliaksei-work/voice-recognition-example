import {useCallback} from 'react';

// Replace with your actual API key
const GEMINI_API_KEY = 'AIzaSyCwcVwQDnXJewl8zZUH-BCOjgWECk98RTI';

// Set to false to disable API calls and use only fallback parser
const USE_GEMINI_API = true;

export interface ExpenseData {
  amount: number;
  category: string;
  description: string;
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

      const parseExpenseFallback = (text: string): ExpenseData => {
        // Simple regex patterns for common expense formats
        const amountMatch = text.match(
          /(\d+(?:[.,]\d{2})?)\s*(евро|euro|рубл|руб|доллар|dollar|usd|eur)/i,
        );
        const amount = amountMatch
          ? parseFloat(amountMatch[1].replace(',', '.'))
          : 0;

        const category = getCategoryFromText(text);
        const description = text.trim();

        return {amount, category, description};
      };

      // If API is disabled, use fallback immediately
      if (!USE_GEMINI_API) {
        console.log('Gemini API disabled, using fallback parser');
        return parseExpenseFallback(text);
      }

      try {
        const prompt = `Extract expense info from: "${text}". Return JSON: {"amount": number, "category": "food|transport|entertainment|shopping|other", "description": "string"}`;

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

        return {
          amount: expenseData.amount || 0,
          category: expenseData.category || 'other',
          description: expenseData.description || text,
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
