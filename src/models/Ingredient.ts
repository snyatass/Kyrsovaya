
export class Ingredient {
  constructor(
    public id: string,
    public name: string,
    public description: string = '',
    public isAvailable: boolean = true
  ) {}

  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Імʼя інгредієнта не може бути порожнім.');
    }
    this.name = name.trim();
  }

  updateDescription(description: string): void {
    this.description = description.trim();
  }

  setAvailability(isAvailable: boolean): void {
    this.isAvailable = isAvailable;
  }
}
