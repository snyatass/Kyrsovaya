import { OrderService } from '../src/bll/OrderService';
import { Dish } from '../src/models/Dish';
import { Ingredient } from '../src/models/Ingredient';
import { ValidationError, NotFoundError } from '../src/bll/errors';

const mockOrderRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn(),
  createOrder: jest.fn() 
};

const mockDishRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

const mockIngRepo = {
  loadAll: jest.fn(),
  saveAll: jest.fn()
};

describe('OrderService (Unit Tests with Mocks)', () => {
  let orderService: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService(
      mockOrderRepo as any,
      mockDishRepo as any
    );
  });

  test('createOrder: должен создать заказ и правильно посчитать сумму', () => {
    const fakeDish = new Dish('d1', 'Борщ', 50, 20, ['ing1']);
    mockDishRepo.loadAll.mockReturnValue([fakeDish]);
    mockOrderRepo.loadAll.mockReturnValue([]);

    // АКТ
    const result = orderService.createOrder(1, [{ dishId: 'd1', quantity: 2 }]);
    // Асерт
    expect(result.totalPrice).toBe(100);
    expect(result.items.length).toBe(1);
    
    // проверочкаа
    expect(mockOrderRepo.saveAll).toHaveBeenCalledTimes(1);
  });

  test('createOrder: должен выбросить ошибку, если стравы не существует', () => {
    // АКТ
    mockDishRepo.loadAll.mockReturnValue([]); // Пустая база страв

    // Асерт
    expect(() => {
      orderService.createOrder(1, [{ dishId: 'ghost_dish', quantity: 1 }]);
    }).toThrow(ValidationError);

    // проверочкаа
    expect(mockOrderRepo.saveAll).not.toHaveBeenCalled();
  });

  test('createOrder: должен выбросить ошибку, если количество <= 0', () => {
     // АКТ
     const fakeDish = new Dish('d1', 'Суп', 50, 10, []);
     mockDishRepo.loadAll.mockReturnValue([fakeDish]);
 
     // Асерт проверочкаа
     expect(() => {
       orderService.createOrder(1, [{ dishId: 'd1', quantity: -5 }]);
     }).toThrow(ValidationError);
  });

  test('deleteOrder: должен удалить существующий заказ', () => {
    const existingOrder = { id: 'ord_1', tableNumber: 1, items: [], totalPrice: 0 };

    mockOrderRepo.loadAll.mockReturnValue([existingOrder]);
    orderService.deleteOrder('ord_1');
    expect(mockOrderRepo.saveAll).toHaveBeenCalledTimes(1);
    
    const savedData = mockOrderRepo.saveAll.mock.calls[0][0];

    expect(savedData.length).toBe(0);
  });

  test('deleteOrder: должен выбросить ошибку, если удаляем несуществующий заказ', () => {
    mockOrderRepo.loadAll.mockReturnValue([]);
    expect(() => {
      orderService.deleteOrder('ord_999');
    }).toThrow(NotFoundError);
  });
});