import { DishService } from '../src/bll/DishService';
import { Dish } from '../src/models/Dish';
import { Ingredient } from '../src/models/Ingredient';
import { ValidationError } from '../src/bll/errors';

const mockDishRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

const mockIngRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

describe('DishService (Unit Tests with Mocks)', () => {
  let dishService: DishService;

  beforeEach(() => {
    jest.clearAllMocks();
    dishService = new DishService(
      mockDishRepo as any,
      mockIngRepo as any
    );
  });

  test('addDish: повинно успішно створити страву', () => {
    const fakeIng = new Ingredient('ing_1', 'Тісто', '', true);
    mockIngRepo.loadAll.mockReturnValue([fakeIng]);
    mockDishRepo.loadAll.mockReturnValue([]);

    const result = dishService.addDish('Піца', 150, 20, ['ing_1']);
    expect(result.name).toBe('Піца');
    expect(result.price).toBe(150);
    expect(mockDishRepo.saveAll).toHaveBeenCalledTimes(1);
  });

  test('addDish: повинно викинути помилку, якщо інгредієнта не існує', () => {
    mockIngRepo.loadAll.mockReturnValue([]); 

    expect(() => {
      dishService.addDish('Піца', 150, 20, ['fake_ing_id']);
    }).toThrow(ValidationError);

    expect(mockDishRepo.saveAll).not.toHaveBeenCalled();
  });

  test('addDish: повинно викинути помилку, якщо страва з такою назвою вже є', () => {

    const fakeIng = new Ingredient('ing_1', 'Тісто', '', true);
    mockIngRepo.loadAll.mockReturnValue([fakeIng]);

    const existingDish = new Dish('d1', 'Піца', 100, 10, ['ing_1']);
    mockDishRepo.loadAll.mockReturnValue([existingDish]);

    expect(() => {
      dishService.addDish('Піца', 200, 30, ['ing_1']);
    }).toThrow(ValidationError);
  });
});