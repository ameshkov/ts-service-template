/**
 * Example tests for UserService demonstrating testing patterns with testcontainers.
 * This file can be removed or replaced with your own test implementations.
 */

import { describe, it, expect } from 'vitest';
import { getTestDb } from '../test/setup.js';
import { UserService } from './users.js';

describe('UserService', () => {
  const getUserService = () => new UserService(getTestDb());

  it('should create a user', async () => {
    const user = await getUserService().createUser({
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should get user by id', async () => {
    const created = await getUserService().createUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    const found = await getUserService().getUserById(created.id);

    expect(found).toBeDefined();
    expect(found?.name).toBe('Jane Doe');
    expect(found?.email).toBe('jane@example.com');
  });

  it('should return undefined for non-existent user', async () => {
    const found = await getUserService().getUserById(99999);
    expect(found).toBeUndefined();
  });

  it('should get user by email', async () => {
    await getUserService().createUser({
      name: 'Bob Smith',
      email: 'bob@example.com',
    });

    const found = await getUserService().getUserByEmail('bob@example.com');

    expect(found).toBeDefined();
    expect(found?.name).toBe('Bob Smith');
  });

  it('should get all users', async () => {
    await getUserService().createUser({ name: 'User 1', email: 'user1@example.com' });
    await getUserService().createUser({ name: 'User 2', email: 'user2@example.com' });

    const allUsers = await getUserService().getAllUsers();

    expect(allUsers).toHaveLength(2);
  });

  it('should delete a user', async () => {
    const user = await getUserService().createUser({
      name: 'Delete Me',
      email: 'delete@example.com',
    });

    const deleted = await getUserService().deleteUser(user.id);
    expect(deleted).toBe(true);

    const found = await getUserService().getUserById(user.id);
    expect(found).toBeUndefined();
  });

  it('should return false when deleting non-existent user', async () => {
    const deleted = await getUserService().deleteUser(99999);
    expect(deleted).toBe(false);
  });
});
