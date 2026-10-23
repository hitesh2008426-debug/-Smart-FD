import type { Handler } from '@netlify/functions';
import { verifyToken } from './admin-auth';
import { offerInputSchema } from '../../src/shared/validation';
import { dbService } from '../../src/database/db';

export const handler: Handler = async (event) => {
  // Authorization check
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Unauthorized. Valid administrator Bearer token required.',
      }),
    };
  }

  const token = authHeader.substring(7);
  const tokenVerification = verifyToken(token);
  if (!tokenVerification.valid) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Forbidden. Expired or invalid authentication token.',
      }),
    };
  }

  try {
    const rawBody = event.body ? JSON.parse(event.body) : {};

    // 1. POST: Create new offer
    if (event.httpMethod === 'POST') {
      const parsed = offerInputSchema.safeParse(rawBody);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Validation failed',
            issues: parsed.error.issues,
          }),
        };
      }

      const created = await dbService.createOffer(parsed.data);
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: created }),
      };
    }

    // 2. PUT: Update existing offer
    if (event.httpMethod === 'PUT') {
      const offerId = event.queryStringParameters?.id || rawBody.id;
      if (!offerId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Offer ID is required' }),
        };
      }

      const reason = rawBody.changeReason || 'Administrator update';
      const updated = await dbService.updateOffer(offerId, rawBody, reason);

      if (!updated) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Offer not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: updated }),
      };
    }

    // 3. PATCH: Disable / decommission offer
    if (event.httpMethod === 'PATCH') {
      const offerId = event.queryStringParameters?.id || rawBody.id;
      if (!offerId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Offer ID is required' }),
        };
      }

      const success = await dbService.disableOffer(offerId);
      if (!success) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Offer not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Offer marked inactive successfully' }),
      };
    }

    // 4. GET: Get audit history of an offer
    if (event.httpMethod === 'GET') {
      const offerId = event.queryStringParameters?.historyFor;
      if (offerId) {
        const history = await dbService.getRateHistory(offerId);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, data: history }),
        };
      }

      const allOffers = await dbService.getOffers(false);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: allOffers }),
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error in offer management';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
