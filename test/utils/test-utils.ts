import { ObjectId } from 'mongodb';

export function aRandomInt(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function aRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

export function aRandomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function aRandomFloat(min: number = 0, max: number = 100, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

export function aRandomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function aRandomObjectId(): ObjectId {
  return new ObjectId();
}

export function aRandomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function aRandomArrayOf<T>(generator: () => T, length: number = 5): T[] {
  return Array.from({ length }, generator);
}

export function aRandomEnumValue<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  return values[Math.floor(Math.random() * values.length)];
}

export function aRandomPartialObject<T extends object>(template: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(template).map(([key, value]) => [key, Math.random() < 0.5 ? value : undefined])
  ) as Partial<T>;
}

export function aRandomEmail(): string {
  return `${aRandomString(8)}@${aRandomString(6)}.com`;
}

export function aRandomPassword(length: number = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function aRandomApiKey(): string {
  return `sk_${aRandomChoice(['test', 'live'])}_${aRandomString(32)}`;
}

export function aRandomToken(): string {
  return `tok_${aRandomString(24)}`;
}

export function aRandomHttpMethod(): string {
  return aRandomChoice(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
}

export function aRandomStatusCode(): number {
  return aRandomChoice([200, 201, 204, 400, 401, 403, 404, 500]);
}

export function aRandomUrl(): string {
  const paths = ['users', 'posts', 'comments', 'products', 'orders'];
  const path = aRandomChoice(paths);
  return `/${path}${aRandomBoolean() ? `/${aRandomObjectId().toString()}` : ''}`;
}

export function aRandomUserData() {
  return {
    name: aRandomString(12),
    email: aRandomEmail(),
    age: aRandomInt(18, 80)
  };
}

export function aRandomUser() {
  return {
    _id: aRandomObjectId(),
    ...aRandomUserData(),
    createdAt: aRandomDate(),
    updatedAt: aRandomDate()
  };
}
