const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const config = require('../utils/config');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
});

describe('GET /api/blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blog = new Blog({
      title: 'Test blog',
      author: 'Tester',
      url: 'http://example.com',
      likes: 5
    });

    await blog.save();
  });

  test('returns blogs as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  })

  test('returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs');
    assert.strictEqual(response.body.length, 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
