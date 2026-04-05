import type { ZodSchema } from 'zod';

import { ApiError } from '../errors/api-error.js';

export function parseOrThrow<T>(schema: ZodSchema<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', parsed.error.flatten());
  }
  return parsed.data;
}
