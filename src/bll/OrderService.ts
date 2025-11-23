
import { Order, OrderItem } from '../models/Order';
import { Dish } from '../models/Dish';
import { OrderRepository } from '../dal/OrderRepository';
import { DishRepository } from '../dal/DishRepository';
import { NotFoundError, ValidationError } from './errors';
import { generateId } from './utils';

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository = new OrderRepository(),
    private readonly dishRepo: DishRepository = new DishRepository()
  ) {}

  getAll(): Order[] {
    return this.orderRepo.loadAll();
  }

  findById(id: string): Order {
    const orders = this.orderRepo.loadAll();
    const order = orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundError('Замовлення', id);
    }
    return order;
  }

  searchByKeyword(keyword: string): Order[] {
    const k = keyword.trim().toLowerCase();
    return this.orderRepo
      .loadAll()
      .filter(o =>
        o.id.toLowerCase().includes(k) ||
        o.tableNumber.toString().includes(k)
      );
  }

  createOrder(tableNumber: number, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new ValidationError('Замовлення повинно містити хоча б одну страву.');
    }
    const normalizedItems = items.map(i => {
      if (i.quantity <= 0) {
        throw new ValidationError('Кількість страв повинна бути більшою за нуль.');
      }
      return { ...i };
    });

    const dishes: Dish[] = this.dishRepo.loadAll();
    let total = 0;
    for (const item of normalizedItems) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) {
        throw new ValidationError(`Страву з id=${item.dishId} не знайдено.`);
      }
      total += dish.price * item.quantity;
    }

    const order: Order = new Order(
      generateId('ord_'),
      tableNumber,
      normalizedItems,
      total,
      new Date().toISOString()
    );

    const orders = this.orderRepo.loadAll();
    orders.push(order);
    this.orderRepo.saveAll(orders);
    return order;
  }

  updateOrder(id: string, tableNumber: number, items: OrderItem[]): Order {
    const orders = this.orderRepo.loadAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      throw new NotFoundError('Замовлення', id);
    }
    if (items.length === 0) {
      throw new ValidationError('Замовлення повинно містити хоча б одну страву.');
    }

    const dishes: Dish[] = this.dishRepo.loadAll();
    let total = 0;
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new ValidationError('Кількість страв повинна бути більшою за нуль.');
      }
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) {
        throw new ValidationError(`Страву з id=${item.dishId} не знайдено.`);
      }
      total += dish.price * item.quantity;
    }

    orders[index].tableNumber = tableNumber;
    orders[index].items = items;
    orders[index].totalPrice = total;

    this.orderRepo.saveAll(orders);
    return orders[index];
  }

  deleteOrder(id: string): void {
    const orders = this.orderRepo.loadAll();
    const exists = orders.some(o => o.id === id);
    if (!exists) {
      throw new NotFoundError('Замовлення', id);
    }
    const remaining = orders.filter(o => o.id !== id);
    this.orderRepo.saveAll(remaining);
  }
}
