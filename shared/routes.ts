
import { z } from 'zod';
import { insertPlaceSchema, insertReviewSchema, places, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  places: {
    list: {
      method: 'GET' as const,
      path: '/api/places' as const,
      input: z.object({
        search: z.string().optional(),
        vibe: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof places.$inferSelect>()), // Returns simple list first
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/places/:id' as const,
      responses: {
        200: z.custom<typeof places.$inferSelect & { crowdPrediction?: any }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/places' as const,
      input: insertPlaceSchema,
      responses: {
        201: z.custom<typeof places.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews' as const,
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listByPlace: {
      method: 'GET' as const,
      path: '/api/places/:id/reviews' as const,
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    predictCrowd: {
      method: 'GET' as const,
      path: '/api/places/:id/crowd-prediction' as const,
      responses: {
        200: z.object({
          placeId: z.number(),
          currentLevel: z.enum(['quiet', 'moderate', 'busy', 'packed']),
          predictedLevelNextHour: z.enum(['quiet', 'moderate', 'busy', 'packed']),
          explanation: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
