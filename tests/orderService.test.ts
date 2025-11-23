
import { DishService } from '../src/bll/DishService';
import { IngredientService } from '../src/bll/IngredientService';
import { OrderService } from '../src/bll/OrderService';

describe('OrderService', () => {
  const ingredientService = new IngredientService();
  const dishService = new DishService();
  const orderService = new OrderService();

  it('creates order and calculates total', () => {
    const ing = ingredientService.addIngredient('Тісто', '');
    const dish = dishService.addDish('Хліб', 30, 15, [ing.id]);

    const order = orderService.createOrder(1, [
      { dishId: dish.id, quantity: 2 }
    ]);

    expect(order.totalPrice).toBe(60);
    expect(order.items.length).toBe(1);
  });
});
