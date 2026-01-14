/**
 * Example service demonstrating database operations with Drizzle ORM.
 * This file can be removed or replaced with your own service implementations.
 */

import { eq } from 'drizzle-orm';
import { Database, users, User, NewUser } from '../db/index.js';

export class UserService {
  constructor(private db: Database) {}

  async createUser(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}
