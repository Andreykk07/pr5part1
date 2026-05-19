import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import { validate } from './middlewares/validate.middleware';
import { RecipeCreateSchema, RatingCreateSchema } from './schemas/recipe.schema';

const app = express();
app.use(express.json());

const openapiDocument = yaml.load(path.join(__dirname, '../openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  steps: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  prepTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const recipesDb: Recipe[] = [
  {
    id: 1,
    title: 'Oatmeal Breakfast',
    description: 'Healthy morning oatmeal with berries',
    ingredients: [{ name: 'Oats', amount: 50, unit: 'g' }],
    steps: ['Boil milk', 'Add oats', 'Serve'],
    category: 'breakfast',
    prepTime: 10,
    servings: 1,
    difficulty: 'easy'
  }
];

const ratingsDb: Record<number, number[]> = { 1: [5, 4] };

// 1. GET /recipes (With strict validation, pagination & filters)
app.get('/recipes', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const { category, difficulty, maxTime } = req.query;

  let filtered = [...recipesDb];

  if (category) filtered = filtered.filter(r => r.category === category);
  if (difficulty) filtered = filtered.filter(r => r.difficulty === difficulty);
  if (maxTime) filtered = filtered.filter(r => r.prepTime <= parseInt(maxTime as string));

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  res.json({
    data: paginatedData,
    meta: { total, page, limit, totalPages }
  });
});

// 2. POST /recipes
app.post('/recipes', validate(RecipeCreateSchema), (req: Request, res: Response) => {
  const newRecipe: Recipe = {
    id: recipesDb.length + 1,
    ...req.body
  };
  recipesDb.push(newRecipe);
  res.status(201).json({ data: newRecipe });
});

// 3. GET /recipes/:id
app.get('/recipes/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const recipe = recipesDb.find(r => r.id === id);

  if (!recipe) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Recipe with ID ${id} not found` }
    });
  }
  res.json({ data: recipe });
});

// 4. POST /recipes/:id/ratings
app.post('/recipes/:id/ratings', validate(RatingCreateSchema), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const recipeExists = recipesDb.some(r => r.id === id);

  if (!recipeExists) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Recipe with ID ${id} not found` }
    });
  }

  if (!ratingsDb[id]) ratingsDb[id] = [];
  ratingsDb[id].push(req.body.score);

  res.status(201).json({ data: { recipeId: id, scores: ratingsDb[id] } });
});

// 5. GET /categories
app.get('/categories', (req: Request, res: Response) => {
  res.json({ data: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] });
});

export default app;
