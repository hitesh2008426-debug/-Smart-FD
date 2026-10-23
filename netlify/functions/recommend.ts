import type { Handler } from '@netlify/functions';
import { calculationInputSchema } from '../../src/shared/validation';
import { evaluateOffers, generateRecommendation } from '../../src/shared/recommendation';
import { dbService } from '../../src/database/db';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    const rawBody = event.body ? JSON.parse(event.body) : {};
    const validationResult = calculationInputSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid recommendation parameters',
          issues: validationResult.error.issues,
        }),
      };
    }

    const input = validationResult.data;
    const offers = await dbService.getOffers(true);
    const comparisonResults = evaluateOffers({ offers, input });
    const recommendation = generateRecommendation(comparisonResults, input);

    if (!recommendation) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: null,
          message: 'No eligible offers found matching your specific constraints. Consider adjusting your tenure, minimum rate, or deposit amount.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: recommendation,
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server recommendation error';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
