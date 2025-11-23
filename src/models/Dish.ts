import { Ingredient } from './Ingredient';

export class Dish {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public preparationTimeMinutes: number,
    public ingredientIds: string[]
  ) {
    if (!name.trim()) {
      throw new Error('Назва страви не може бути порожньою.');
    }
    if (price < 0) {
      throw new Error('Ціна страви не може бути відʼємною.');
    }
    if (preparationTimeMinutes <= 0) {
      throw new Error('Час приготування повинен бути більшим за нуль.');
    }
  }

  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Назва страви не може бути порожньою.');
    }
    this.name = name.trim();
  }

  updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Ціна страви не може бути відʼємною.');
    }
    this.price = price;
  }

  updatePreparationTime(minutes: number): void {
    if (minutes <= 0) {
      throw new Error('Час приготування повинен бути більшим за нуль.');
    }
    this.preparationTimeMinutes = minutes;
  }

  setIngredients(ingredientIds: string[]): void {
    this.ingredientIds = [...ingredientIds];
  }
}
