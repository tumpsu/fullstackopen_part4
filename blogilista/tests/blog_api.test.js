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
  });

  test('returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs');
    assert.strictEqual(response.body.length, 1);
  });
});

test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs');
  const blog = response.body[0];

  assert.ok(blog.id);
  assert.strictEqual(blog._id, undefined);
});

describe('POST /api/blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const initialBlog = new Blog({
      title: 'Initial blog',
      author: 'Tester',
      url: 'http://example.com',
      likes: 1
    });

    await initialBlog.save();
  });

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Author',
      url: 'http://example.com/new',
      likes: 10
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    assert.strictEqual(response.body.length, 2);

    const titles = response.body.map(b => b.title);
    assert.ok(titles.includes('New blog'));
  });

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Author',
      url: 'http://example.com',
      likes: 5
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  });

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'Missing URL',
      author: 'Author',
      likes: 5
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  });
});

test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author',
    url: 'http://example.com/no-likes'
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.likes, 0);
});

describe('DELETE /api/blogs/:id', () => {
  let blogId;

  beforeEach(async () => {
    await Blog.deleteMany({});;

    const blog = new Blog({
      title: 'Blog to delete',
      author: 'Tester',
      url: 'http://example.com',
      likes: 1
    });

    const saved = await blog.save();
    blogId = saved.id;
  });

  test('a blog can be deleted', async () => {
    await api
      .delete(`/api/blogs/${blogId}`)
      .expect(204);

    const blogsAfter = await api.get('/api/blogs');
    assert.strictEqual(blogsAfter.body.length, 0);
  });
});


describe('PUT /api/blogs/:id', () => {
  let blogId;

  beforeEach(async () => {
    await Blog.deleteMany({});

    const blog = new Blog({
      title: 'Blog to update',
      author: 'Tester',
      url: 'http://example.com',
      likes: 1
    });

    const saved = await blog.save();
    blogId = saved.id;
  });

  test('a blog\'s likes can be updated', async () => {
    const updatedData = { likes: 10 };

    const response = await api
      .put(`/api/blogs/${blogId}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.likes, 10);
  });
});

after(async () => {
  await mongoose.connection.close();
});
