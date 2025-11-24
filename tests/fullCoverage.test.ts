import { IngredientService } from '../src/bll/IngredientService';
import { Ingredient } from '../src/models/Ingredient';
import { Dish } from '../src/models/Dish';
import { ValidationError, NotFoundError } from '../src/bll/errors';

const mockIngRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

const mockDishRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

describe('IngredientService & Integrity (Unit Tests with Mocks)', () => {
  let ingredientService: IngredientService;

  beforeEach(() => {
    jest.clearAllMocks();
    ingredientService = new IngredientService(
      mockIngRepo as any,
      mockDishRepo as any
    );
  });

  // ТЕСТИ ІНГРЕДІЄНТ

  test('addIngredient: успішне додавання', () => {
    mockIngRepo.loadAll.mockReturnValue([]); // База пуста

    const result = ingredientService.addIngredient('Сир', 'Моцарела');

    expect(result.name).toBe('Сир');
    expect(mockIngRepo.saveAll).toHaveBeenCalledTimes(1);
  });

  test('searchByKeyword: пошук працює', () => {
    const i1 = new Ingredient('1', 'Сир');
    const i2 = new Ingredient('2', 'Хліб');
    mockIngRepo.loadAll.mockReturnValue([i1, i2]);

    const result = ingredientService.searchByKeyword('сир');
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Сир');
  });

  // --- ТЕСТИ ЦІЛІСНОСТІ ДАНИХ

  test('removeIngredient: НЕ МОЖНА видалити інгредієнт, якщо він у страві', () => {
    const ingId = 'ing_locked';
    const ing = new Ingredient(ingId, 'Важливий соус');
    
    mockIngRepo.loadAll.mockReturnValue([ing]);
    
    const dishUsingIng = new Dish('d1', 'Паста', 100, 15, [ingId]);
    mockDishRepo.loadAll.mockReturnValue([dishUsingIng]);

    expect(() => {
      ingredientService.removeIngredient(ingId);
    }).toThrow(ValidationError); 

    expect(mockIngRepo.saveAll).not.toHaveBeenCalled();
  });

  test('removeIngredient: МОЖНА видалити, якщо він не використовується', () => {
    const ingId = 'ing_free';
    const ing = new Ingredient(ingId, 'Вільний продукт');

    mockIngRepo.loadAll.mockReturnValue([ing]);
    mockDishRepo.loadAll.mockReturnValue([]);

    ingredientService.removeIngredient(ingId);

    expect(mockIngRepo.saveAll).toHaveBeenCalledTimes(1);
    const savedData = mockIngRepo.saveAll.mock.calls[0][0];
    expect(savedData.length).toBe(0);
  });
});