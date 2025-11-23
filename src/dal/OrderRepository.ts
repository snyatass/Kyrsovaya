
import { FileRepository } from './fileRepository';
import { Order } from '../models/Order';

export class OrderRepository extends FileRepository<Order> {
  constructor() {
    super('orders.json');
  }
}
