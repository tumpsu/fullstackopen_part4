const { test, describe, beforeEach, before, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const config = require('../utils/config');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});

  const user = new User({
    username: 'root',
    name: 'Superuser',
    passwordHash: 'hashedpassword'
  });

  await user.save();
});

describe('creating a new user', () => {
  test('succeeds with valid data', async () => {
    const newUser = {
      username: 'tuomas',
      name: 'Tuomas Keskitalo',
      password: 'salasana123'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const users = await api.get('/api/users');
    assert.strictEqual(users.body.length, 2);

    const usernames = users.body.map(u => u.username);
    assert.ok(usernames.includes('tuomas'));
  });

  test('creation fails if username is too short', async () => {
    const newUser = {
      username: 'ab',
      name: 'Short User',
      password: 'validpass'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    assert.match(result.body.error, /username.*minimum/i);

    const usersAtEnd = await api.get('/api/users');
    assert.strictEqual(usersAtEnd.body.length, 1);
  });

  test('creation fails if password is too short', async () => {
    const newUser = {
      username: 'validuser',
      name: 'User',
      password: '12'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    assert.match(result.body.error, /password must be at least 3 characters/i);

    const usersAtEnd = await api.get('/api/users');
    assert.strictEqual(usersAtEnd.body.length, 1);
  });

  test('creation fails if username already exists', async () => {
    const newUser = {
      username: 'root',
      name: 'Duplicate',
      password: 'validpass'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    assert.match(result.body.error, /username.*unique/i);

    const usersAtEnd = await api.get('/api/users');
    assert.strictEqual(usersAtEnd.body.length, 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
