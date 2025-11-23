
import { Dish } from '../models/Dish';
import { Ingredient } from '../models/Ingredient';
import { DishRepository } from '../dal/DishRepository';
import { IngredientRepository } from '../dal/IngredientRepository';
import { NotFoundError, ValidationError } from './errors';
import { generateId } from './utils';

export class DishService {
  constructor(
    private readonly dishRepo: DishRepository = new DishRepository(),
    private readonly ingredientRepo: IngredientRepository = new IngredientRepository()
  ) {}

  getAll(): Dish[] {
    return this.dishRepo.loadAll();
  }

  findById(id: string): Dish {
    const dishes = this.dishRepo.loadAll();
    const dish = dishes.find(d => d.id === id);
    if (!dish) {
      throw new NotFoundError('Страва', id);
    }
    return dish;
  }

  getIngredientsForDish(dish: Dish): Ingredient[] {
    const ingredients = this.ingredientRepo.loadAll();
    return ingredients.filter(i => dish.ingredientIds.includes(i.id));
  }

  searchByKeyword(keyword: string): Dish[] {
    const k = keyword.trim().toLowerCase();
    return this.dishRepo
      .loadAll()
      .filter(d => d.name.toLowerCase().includes(k));
  }

  addDish(
    name: string,
    price: number,
    preparationTimeMinutes: number,
    ingredientIds: string[],
    id?: string
  ): Dish {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Назва страви не може бути порожньою.');
    }
    if (price < 0) {
      throw new ValidationError('Ціна страви не може бути відʼємною.');
    }
    if (preparationTimeMinutes <= 0) {
      throw new ValidationError('Час приготування повинен бути більшим за нуль.');
    }
    this.ensureIngredientsExist(ingredientIds);

    const dishes = this.dishRepo.loadAll();
    if (dishes.some(d => d.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new ValidationError('Страва з такою назвою вже існує.');
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
      if (dishes.some(d => d.id === trimmedId)) {
        throw new ValidationError('ID вже використовується.');
      }
      finalId = trimmedId;
    } else {
      finalId = generateId('dish_');
    }

    const dish = new Dish(
      finalId,
      trimmedName,
      price,
      preparationTimeMinutes,
      ingredientIds
    );

    dishes.push(dish);
    this.dishRepo.saveAll(dishes);
    return dish;
  }

  updateDish(
    id: string,
    name: string,
    price: number,
    preparationTimeMinutes: number,
    ingredientIds: string[]
  ): Dish {
    const dishes = this.dishRepo.loadAll();
    const index = dishes.findIndex(d => d.id === id);
    if (index === -1) {
      throw new NotFoundError('Страва', id);
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ValidationError('Назва страви не може бути порожньою.');
    }
    if (price < 0) {
      throw new ValidationError('Ціна страви не може бути відʼємною.');
    }
    if (preparationTimeMinutes <= 0) {
      throw new ValidationError('Час приготування повинен бути більшим за нуль.');
    }
    this.ensureIngredientsExist(ingredientIds);

    if (dishes.some(d => d.id !== id && d.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new ValidationError('Страва з такою назвою вже існує.');
    }

    const dish = dishes[index];
    dish.name = trimmedName;
    dish.price = price;
    dish.preparationTimeMinutes = preparationTimeMinutes;
    dish.ingredientIds = [...ingredientIds];

    this.dishRepo.saveAll(dishes);
    return dish;
  }

  removeDish(id: string): void {
    const dishes = this.dishRepo.loadAll();
    const exists = dishes.some(d => d.id === id);
    if (!exists) {
      throw new NotFoundError('Страва', id);
    }
    const remaining = dishes.filter(d => d.id !== id);
    this.dishRepo.saveAll(remaining);
  }

  private ensureIngredientsExist(ingredientIds: string[]): void {
    const ingredients = this.ingredientRepo.loadAll();
    const missing = ingredientIds.filter(
      id => !ingredients.some(i => i.id === id)
    );
    if (missing.length > 0) {
      throw new ValidationError('Не всі інгредієнти існують. Відсутні: ' + missing.join(', '));
    }
  }
}
