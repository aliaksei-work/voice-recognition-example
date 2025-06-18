import {useCallback} from 'react';

// Replace with your actual API key
const GEMINI_API_KEY = 'AIzaSyCwcVwQDnXJewl8zZUH-BCOjgWECk98RTI';

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

      try {
        const prompt = `
          Analyze the following text and extract expense information. 
          Return ONLY a valid JSON object with the following structure:
          {
            "amount": number (extract the monetary amount),
            "category": string (categorize the expense: food, transport, entertainment, shopping, etc.),
            "description": string (brief description of the expense)
          }
          
          Text to analyze: "${text}"
          
          If no amount is found, use 0. If no clear category, use "other".
        `;

        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GEMINI_API_KEY}`,
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
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
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
