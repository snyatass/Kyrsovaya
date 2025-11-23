
import readline from 'readline';
import { IngredientService } from '../bll/IngredientService';
import { DishService } from '../bll/DishService';
import { OrderService } from '../bll/OrderService';
import { DomainError } from '../bll/errors';

const ingredientService = new IngredientService();
const dishService = new DishService();
const orderService = new OrderService();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer));
  });
}

async function mainMenu(): Promise<void> {
  let exit = false;
  while (!exit) {
    console.log('\n=== РЕСТОРАН: ГОЛОВНЕ МЕНЮ ===');
    console.log('1. Інгредієнти');
    console.log('2. Страви');
    console.log('3. Замовлення');
    console.log('4. Пошук');
    console.log('0. Вихід');

    const choice = (await ask('Оберіть пункт меню: ')).trim();

    try {
      switch (choice) {
        case '1':
          await ingredientsMenu();
          break;
        case '2':
          await dishesMenu();
          break;
        case '3':
          await ordersMenu();
          break;
        case '4':
          await searchMenu();
          break;
        case '0':
          exit = true;
          break;
        default:
          console.log('Невірний пункт меню.');
      }
    } catch (err) {
      if (err instanceof DomainError) {
        console.log('ПОМИЛКА:', err.message);
      } else if (err instanceof Error) {
        console.log('НЕОЧІКУВАНА ПОМИЛКА:', err.message);
      } else {
        console.log('Невідома помилка.');
      }
    }
  }

  rl.close();
}

async function ingredientsMenu(): Promise<void> {
  let back = false;
  while (!back) {
    console.log('\n--- ІНГРЕДІЄНТИ ---');
    console.log('1. Переглянути всі');
    console.log('2. Додати');
    console.log('3. Редагувати');
    console.log('4. Видалити');
    console.log('0. Назад');

    const choice = (await ask('> ')).trim();
    switch (choice) {
      case '1':
        const all = ingredientService.getAll();
        if (all.length === 0) {
          console.log('Список інгредієнтів порожній.');
        } else {
          for (const ing of all) {
            console.log(`- ${ing.id}: ${ing.name} (${ing.isAvailable ? 'доступний' : 'недоступний'})`);
          }
        }
        break;
      case '2':
        const name = await ask('Назва: ');
        const desc = await ask('Опис (необовʼязково): ');
        const idInput = await ask('ID (залишіть порожнім для автогенерації): ');
        const providedId = idInput ? idInput.trim() : undefined;
        const created = ingredientService.addIngredient(name, desc, providedId);
        console.log('Додано інгредієнт з id:', created.id);
        break;
      case '3':
        const editId = await ask('ID інгредієнта: ');
        const newName = await ask('Нова назва: ');
        const newDesc = await ask('Новий опис: ');
        const availStr = await ask('Доступний? (y/n): ');
        const isAvail = availStr.trim().toLowerCase() !== 'n';
        const updated = ingredientService.updateIngredient(editId.trim(), newName, newDesc, isAvail);
        console.log('Оновлено інгредієнт:', updated);
        break;
      case '4':
        const delId = await ask('ID інгредієнта для видалення: ');
        ingredientService.removeIngredient(delId.trim());
        console.log('Інгредієнт видалено.');
        break;
      case '0':
        back = true;
        break;
      default:
        console.log('Невірний пункт меню.');
    }
  }
}

async function dishesMenu(): Promise<void> {
  let back = false;
  while (!back) {
    console.log('\n--- СТРАВИ ---');
    console.log('1. Переглянути всі');
    console.log('2. Додати');
    console.log('3. Редагувати');
    console.log('4. Видалити');
    console.log('0. Назад');

    const choice = (await ask('> ')).trim();

    switch (choice) {
      case '1':
        const all = dishService.getAll();
        if (all.length === 0) {
          console.log('Список страв порожній.');
        } else {
          for (const d of all) {
            console.log(`- ${d.id}: ${d.name}, ${d.price} грн, ${d.preparationTimeMinutes} хв.`);
          }
        }
        break;
      case '2':
        await createDish();
        break;
      case '3':
        await editDish();
        break;
      case '4':
        const delId = await ask('ID страви для видалення: ');
        dishService.removeDish(delId.trim());
        console.log('Страву видалено.');
        break;
      case '0':
        back = true;
        break;
      default:
        console.log('Невірний пункт меню.');
    }
  }
}

async function createDish(): Promise<void> {
  const name = await ask('Назва страви: ');
  const idInput = await ask('ID (залишіть порожнім для автогенерації): ');
  const priceStr = await ask('Ціна: ');
  const timeStr = await ask('Час приготування (хв): ');
  // Покажемо список інгредієнтів з номерами, щоб можна було вводити зручніше
  const allIngredients = ingredientService.getAll();
  if (allIngredients.length === 0) {
    console.log('Список інгредієнтів порожній. Додайте інгредієнти спочатку.');
    return;
  }
  console.log('\nДоступні інгредієнти:');
  for (let i = 0; i < allIngredients.length; i++) {
    const ing = allIngredients[i];
    console.log(`${i + 1}) ${ing.id}: ${ing.name}`);
  }

  function parseIngredientInput(input: string): string[] {
    const tokens = input.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const ids: string[] = [];
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        const idx = Number(token);
        if (idx < 1 || idx > allIngredients.length) {
          throw new Error(`Невірний індекс інгредієнта: ${token}`);
        }
        ids.push(allIngredients[idx - 1].id);
        continue;
      }
      const byId = allIngredients.find(i => i.id === token);
      if (byId) {
        ids.push(byId.id);
        continue;
      }
      const byName = allIngredients.filter(i => i.name.toLowerCase() === token.toLowerCase());
      if (byName.length === 1) {
        ids.push(byName[0].id);
        continue;
      }
      const partial = allIngredients.filter(i => i.name.toLowerCase().includes(token.toLowerCase()));
      if (partial.length === 1) {
        ids.push(partial[0].id);
        continue;
      }
      if (byName.length > 1 || partial.length > 1) {
        const names = (byName.length ? byName : partial).map(p => p.name).join(', ');
        throw new Error(`Нечіткий запит "${token}" — знайдено декілька інгредієнтів: ${names}`);
      }
      throw new Error(`Інгредієнт не знайдено: ${token}`);
    }
    return Array.from(new Set(ids));
  }

  let ingredientIds: string[] = [];
  while (true) {
    const ingredientIdsStr = await ask('Введіть інгредієнти (номери, імена або id через кому): ');
    try {
      ingredientIds = parseIngredientInput(ingredientIdsStr);
      break;
    } catch (err) {
      if (err instanceof Error) {
        console.log('ПОМИЛКА:', err.message);
        console.log('Спробуйте ще раз.');
      } else {
        throw err;
      }
    }
  }
  const price = Number(priceStr);
  const time = Number(timeStr);
  const providedId = idInput ? idInput.trim() : undefined;
  const dish = dishService.addDish(name, price, time, ingredientIds, providedId);
  console.log('Додано страву з id:', dish.id);
}

async function editDish(): Promise<void> {
  const id = await ask('ID страви: ');
  const name = await ask('Нова назва страви: ');
  const priceStr = await ask('Нова ціна: ');
  const timeStr = await ask('Новий час приготування (хв): ');
  const allIngredients = ingredientService.getAll();
  if (allIngredients.length === 0) {
    console.log('Список інгредієнтів порожній. Додайте інгредієнти спочатку.');
    return;
  }
  console.log('\nДоступні інгредієнти:');
  for (let i = 0; i < allIngredients.length; i++) {
    const ing = allIngredients[i];
    console.log(`${i + 1}) ${ing.id}: ${ing.name}`);
  }

  function parseIngredientInput(input: string): string[] {
    const tokens = input.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const ids: string[] = [];
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        const idx = Number(token);
        if (idx < 1 || idx > allIngredients.length) {
          throw new Error(`Невірний індекс інгредієнта: ${token}`);
        }
        ids.push(allIngredients[idx - 1].id);
        continue;
      }
      const byId = allIngredients.find(i => i.id === token);
      if (byId) {
        ids.push(byId.id);
        continue;
      }
      const byName = allIngredients.filter(i => i.name.toLowerCase() === token.toLowerCase());
      if (byName.length === 1) {
        ids.push(byName[0].id);
        continue;
      }
      const partial = allIngredients.filter(i => i.name.toLowerCase().includes(token.toLowerCase()));
      if (partial.length === 1) {
        ids.push(partial[0].id);
        continue;
      }
      if (byName.length > 1 || partial.length > 1) {
        const names = (byName.length ? byName : partial).map(p => p.name).join(', ');
        throw new Error(`Нечіткий запит "${token}" — знайдено декілька інгредієнтів: ${names}`);
      }
      throw new Error(`Інгредієнт не знайдено: ${token}`);
    }
    return Array.from(new Set(ids));
  }

  let ingredientIds: string[] = [];
  while (true) {
    const ingredientIdsStr = await ask('Введіть нові інгредієнти (номери, імена або id через кому): ');
    try {
      ingredientIds = parseIngredientInput(ingredientIdsStr);
      break;
    } catch (err) {
      if (err instanceof Error) {
        console.log('ПОМИЛКА:', err.message);
        console.log('Спробуйте ще раз.');
      } else {
        throw err;
      }
    }
  }
  const price = Number(priceStr);
  const time = Number(timeStr);
  const dish = dishService.updateDish(id.trim(), name, price, time, ingredientIds);
  console.log('Оновлено страву:', dish);
}

async function ordersMenu(): Promise<void> {
  let back = false;
  while (!back) {
    console.log('\n--- ЗАМОВЛЕННЯ ---');
    console.log('1. Переглянути всі');
    console.log('2. Створити');
    console.log('3. Редагувати');
    console.log('4. Видалити');
    console.log('0. Назад');

    const choice = (await ask('> ')).trim();

    switch (choice) {
      case '1':
        const all = orderService.getAll();
        if (all.length === 0) {
          console.log('Список замовлень порожній.');
        } else {
          for (const o of all) {
            console.log(`- ${o.id}: стіл ${o.tableNumber}, сума ${o.totalPrice} грн, позицій: ${o.items.length}`);
          }
        }
        break;
      case '2':
        await createOrder();
        break;
      case '3':
        await editOrder();
        break;
      case '4':
        const delId = await ask('ID замовлення для видалення: ');
        orderService.deleteOrder(delId.trim());
        console.log('Замовлення видалено.');
        break;
      case '0':
        back = true;
        break;
      default:
        console.log('Невірний пункт меню.');
    }
  }
}

async function createOrder(): Promise<void> {
  const tableStr = await ask('Номер столика: ');
  const table = Number(tableStr);
  const items: { dishId: string; quantity: number }[] = [];
  let addMore = true;
  while (addMore) {
    const dishId = await ask('ID страви: ');
    const qtyStr = await ask('Кількість: ');
    const qty = Number(qtyStr);
    items.push({ dishId: dishId.trim(), quantity: qty });
    const more = await ask('Додати ще страву? (y/n): ');
    addMore = more.trim().toLowerCase() === 'y';
  }
  const order = orderService.createOrder(table, items);
  console.log('Створено замовлення з id:', order.id);
}

async function editOrder(): Promise<void> {
  const id = await ask('ID замовлення: ');
  const tableStr = await ask('Новий номер столика: ');
  const table = Number(tableStr);
  const items: { dishId: string; quantity: number }[] = [];
  let addMore = true;
  while (addMore) {
    const dishId = await ask('ID страви: ');
    const qtyStr = await ask('Кількість: ');
    const qty = Number(qtyStr);
    items.push({ dishId: dishId.trim(), quantity: qty });
    const more = await ask('Додати ще страву? (y/n): ');
    addMore = more.trim().toLowerCase() === 'y';
  }
  const order = orderService.updateOrder(id.trim(), table, items);
  console.log('Оновлено замовлення:', order);
}

async function searchMenu(): Promise<void> {
  console.log('\n--- ПОШУК ---');
  const keyword = await ask('Ключове слово: ');
  const ing = ingredientService.searchByKeyword(keyword);
  const dishes = dishService.searchByKeyword(keyword);
  const orders = orderService.searchByKeyword(keyword);

  console.log('\nІнгредієнти:');
  if (ing.length === 0) {
    console.log('  Нічого не знайдено.');
  } else {
    for (const i of ing) {
      console.log(`  - ${i.id}: ${i.name}`);
    }
  }

  console.log('\nСтрави:');
  if (dishes.length === 0) {
    console.log('  Нічого не знайдено.');
  } else {
    for (const d of dishes) {
      console.log(`  - ${d.id}: ${d.name}`);
    }
  }

  console.log('\nЗамовлення:');
  if (orders.length === 0) {
    console.log('  Нічого не знайдено.');
  } else {
    for (const o of orders) {
      console.log(`  - ${o.id}: стіл ${o.tableNumber}, сума ${o.totalPrice} грн`);
    }
  }
}

mainMenu().catch(err => {
  console.error('Фатальна помилка:', err);
  rl.close();
});
