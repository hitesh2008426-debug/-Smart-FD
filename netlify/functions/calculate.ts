import type { Handler } from '@netlify/functions';
import { calculationInputSchema } from '../../src/shared/validation';
import { calculateFixedDeposit, convertTenureToMonths } from '../../src/shared/calculator';

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
          error: 'Validation failed',
          issues: validationResult.error.issues,
        }),
      };
    }

    const input = validationResult.data;
    const tenureMonths = convertTenureToMonths(input.tenureValue, input.tenureUnit);

    // Default rate if not comparing against a specific offer
    const rate = input.customerCategory === 'senior_citizen' ? 7.50 : 7.00;

    const result = calculateFixedDeposit({
      principal: input.investmentAmount,
      annualRate: rate,
      tenureMonths,
      depositType: input.depositType,
      payoutFrequency: input.payoutFrequency,
      compoundingFrequency: 'quarterly',
      customerCategory: input.customerCategory,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server calculation error';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
