
import { FileRepository } from './fileRepository';
import { Ingredient } from '../models/Ingredient';

export class IngredientRepository extends FileRepository<Ingredient> {
  constructor() {
    super('ingredients.json');
  }
}
