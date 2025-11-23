
import { Ingredient } from '../models/Ingredient';
import { Dish } from '../models/Dish';
import { IngredientRepository } from '../dal/IngredientRepository';
import { DishRepository } from '../dal/DishRepository';
import { NotFoundError, ValidationError } from './errors';
import { generateId } from './utils';

export class IngredientService {
  constructor(
    private readonly ingredientRepo: IngredientRepository = new IngredientRepository(),
    private readonly dishRepo: DishRepository = new DishRepository()
  ) {}

  getAll(): Ingredient[] {
    return this.ingredientRepo.loadAll();
  }

  findById(id: string): Ingredient {
    const ingredients = this.ingredientRepo.loadAll();
    const ingredient = ingredients.find(i => i.id === id);
    if (!ingredient) {
      throw new NotFoundError('Інгредієнт', id);
    }
    return ingredient;
  }

  searchByKeyword(keyword: string): Ingredient[] {
    const k = keyword.trim().toLowerCase();
    return this.ingredientRepo
      .loadAll()
      .filter(i => i.name.toLowerCase().includes(k) || i.description.toLowerCase().includes(k));
  }

  addIngredient(name: string, description: string = '', id?: string): Ingredient {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Назва інгредієнта не може бути порожньою.');
    }
    const ingredients = this.ingredientRepo.loadAll();
    if (ingredients.some(i => i.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new ValidationError('Інгредієнт з такою назвою вже існує.');
    }
    let finalId: string;
    if (id !== undefined && id !== null) {
      const trimmedId = String(id).trim();
      if (!trimmedId) {
        throw new ValidationError('ID не може бути порожнім.');
      }
      if (!/^[A-Za-z0-9\-_]+$/.test(trimmedId)) {
        throw new ValidationError('ID може містити лише латинські літери, цифри, дефіс і підкреслення.');
      }
      if (ingredients.some(i => i.id === trimmedId)) {
        throw new ValidationError('ID вже використовується.');
      }
      finalId = trimmedId;
    } else {
      finalId = generateId('ing_');
    }

    const ingredient = new Ingredient(finalId, trimmedName, description, true);
    ingredients.push(ingredient);
    this.ingredientRepo.saveAll(ingredients);
    return ingredient;
  }

  updateIngredient(id: string, name: string, description: string, isAvailable: boolean): Ingredient {
    const ingredients = this.ingredientRepo.loadAll();
    const index = ingredients.findIndex(i => i.id === id);
    if (index === -1) {
      throw new NotFoundError('Інгредієнт', id);
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Назва інгредієнта не може бути порожньою.');
    }
    if (ingredients.some(i => i.id !== id && i.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new ValidationError('Інгредієнт з такою назвою вже існує.');
    }
    ingredients[index].name = trimmedName;
    ingredients[index].description = description.trim();
    ingredients[index].isAvailable = isAvailable;
    this.ingredientRepo.saveAll(ingredients);
    return ingredients[index];
  }

  removeIngredient(id: string): void {
    const ingredients = this.ingredientRepo.loadAll();
    const toRemove = ingredients.find(i => i.id === id);
    if (!toRemove) {
      throw new NotFoundError('Інгредієнт', id);
    }
    const dishes: Dish[] = this.dishRepo.loadAll();
    const usedInDish = dishes.find(d => d.ingredientIds.includes(id));
    if (usedInDish) {
      throw new ValidationError(`Неможливо видалити інгредієнт: він використовується у страві "${usedInDish.name}".`);
    }
    const remaining = ingredients.filter(i => i.id !== id);
    this.ingredientRepo.saveAll(remaining);
  }
}
