import type { Handler } from '@netlify/functions';
import { calculationInputSchema } from '../../src/shared/validation';
import { evaluateOffers } from '../../src/shared/recommendation';
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
          error: 'Invalid comparison parameters',
          issues: validationResult.error.issues,
        }),
      };
    }

    const input = validationResult.data;
    const offers = await dbService.getOffers(true);
    const comparisonResults = evaluateOffers({ offers, input });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          input,
          results: comparisonResults,
          totalOffers: offers.length,
          eligibleOffers: comparisonResults.filter((r) => r.isEligible).length,
        },
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server comparison error';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
