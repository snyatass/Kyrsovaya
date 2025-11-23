
import { FileRepository } from './fileRepository';
import { Dish } from '../models/Dish';

export class DishRepository extends FileRepository<Dish> {
  constructor() {
    super('dishes.json');
  }
}
