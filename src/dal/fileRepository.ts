
import fs from 'fs';
import path from 'path';
import { DataAccessError } from './errors';

const DATA_DIR = path.resolve(__dirname, '../../data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class FileRepository<T> {
  constructor(private readonly fileName: string) {
    ensureDataDir();
  }

  private get filePath(): string {
    return path.join(DATA_DIR, this.fileName);
  }

  loadAll(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const raw = fs.readFileSync(this.filePath, { encoding: 'utf-8' });
      if (!raw.trim()) {
        return [];
      }
      return JSON.parse(raw) as T[];
    } catch (err) {
      throw new DataAccessError(`Помилка читання файлу ${this.filePath}`, err);
    }
  }

  saveAll(items: T[]): void {
    try {
      const json = JSON.stringify(items, null, 2);
      fs.writeFileSync(this.filePath, json, { encoding: 'utf-8' });
    } catch (err) {
      throw new DataAccessError(`Помилка запису файлу ${this.filePath}`, err);
    }
  }
}
