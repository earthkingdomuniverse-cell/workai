/**
 * Base Factory Pattern
 * Task 2.1: Test Data Factory Pattern
 * 
 * Base class for all test factories using factory pattern
 */

import { faker } from '@faker-js/faker';

export interface FactoryDefinition<T> {
  (): T;
}

export class Factory<T> {
  private definition: FactoryDefinition<T>;
  private afterCreateHooks: Array<(instance: T) => void> = [];

  constructor(definition: FactoryDefinition<T>) {
    this.definition = definition;
  }

  /**
   * Create a single instance
   */
  create(overrides: Partial<T> = {}): T {
    const base = this.definition();
    const instance = { ...base, ...overrides } as T;
    
    this.afterCreateHooks.forEach(hook => hook(instance));
    
    return instance;
  }

  /**
   * Create multiple instances
   */
  createMany(count: number, overrides: Partial<T> = {}): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Build instance without saving (for unit tests)
   */
  build(overrides: Partial<T> = {}): T {
    const base = this.definition();
    return { ...base, ...overrides } as T;
  }

  /**
   * Add after-create hook
   */
  afterCreate(callback: (instance: T) => void): this {
    this.afterCreateHooks.push(callback);
    return this;
  }
}

/**
 * Factory builder helper
 */
export function defineFactory<T>(definition: FactoryDefinition<T>): Factory<T> {
  return new Factory<T>(definition);
}

/**
 * Faker utilities for test data
 */
export { faker };

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${faker.string.uuid().split('-')[0]}`;
}

/**
 * Generate timestamp
 */
export function generateTimestamp(): Date {
  return faker.date.recent({ days: 30 });
}

/**
 * Random boolean
 */
export function randomBool(): boolean {
  return faker.datatype.boolean();
}

/**
 * Random selection from array
 */
export function randomElement<T>(array: T[]): T {
  return faker.helpers.arrayElement(array);
}

/**
 * Generate multiple random elements
 */
export function randomElements<T>(array: T[], count: number): T[] {
  return faker.helpers.arrayElements(array, count);
}
