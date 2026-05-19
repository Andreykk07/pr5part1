import { z } from 'zod';

export const RecipeCreateSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.number().positive(),
        unit: z.string()
      })
    ).min(1),
    steps: z.array(z.string()).min(1),
    category: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']),
    prepTime: z.number().int().positive(),
    servings: z.number().int().positive(),
    difficulty: z.enum(['easy', 'medium', 'hard'])
  })
});

export const RatingCreateSchema = z.object({
  body: z.object({
    score: z.number().int().min(1).max(5)
  })
});
