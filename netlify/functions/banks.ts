import type { Handler } from '@netlify/functions';
import { dbService } from '../../src/database/db';

export const handler: Handler = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300',
  };

  try {
    const banks = await dbService.getBanks();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: banks,
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch banks';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
