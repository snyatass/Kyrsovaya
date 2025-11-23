
  export interface OrderItem {
    dishId: string;
    quantity: number;
  }

  export class Order {
    constructor(
      public id: string,
      public tableNumber: number,
      public items: OrderItem[],
      public totalPrice: number,
      public createdAt: string 
    ) {
      if (tableNumber <= 0) {
        throw new Error('Номер столика повинен бути більшим за нуль.');
      }
      if (items.length === 0) {
        throw new Error('Замовлення повинно містити хоча б одну страву.');
      }
    }

    updateTableNumber(tableNumber: number): void {
      if (tableNumber <= 0) {
        throw new Error('Номер столика повинен бути більшим за нуль.');
      }
      this.tableNumber = tableNumber;
    }

    updateItems(items: OrderItem[], totalPrice: number): void {
      if (items.length === 0) {
        throw new Error('Замовлення повинно містити хоча б одну страву.');
      }
      this.items = items;
      this.totalPrice = totalPrice;
    }
  }
