import type { Handler } from '@netlify/functions';
import { dbService } from '../../src/database/db';

export const handler: Handler = async (event) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  };

  try {
    const showAll = event.queryStringParameters?.all === 'true';
    const offers = await dbService.getOffers(!showAll);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: offers,
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch FD offers';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
