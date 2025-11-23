
import { DishService } from '../src/bll/DishService';
import { IngredientService } from '../src/bll/IngredientService';

describe('DishService', () => {
  const ingredientService = new IngredientService();
  const dishService = new DishService();

  it('creates dish with valid data', () => {
    const ing = ingredientService.addIngredient('Сир', 'Твердий сир');
    const dish = dishService.addDish('Піцца Маргарита', 150, 20, [ing.id]);
    expect(dish.id).toBeDefined();
    expect(dish.name).toBe('Піцца Маргарита');
    expect(dish.price).toBe(150);
  });
});
