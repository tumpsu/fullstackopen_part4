const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  try
  {
    const blog = new Blog(req.body);
    const users = await User.find({});
    if (users.length === 0)
    {
      return res.status(400).json({ error: 'no users in database' });
    }
    const user = users[0];
    const saved = await blog.save();

    user.blogs = user.blogs.concat(saved._id);
    await user.save();
    res.status(201).json(saved);
  }
  catch (error)
  {
    res.status(400).json({ error: error.message });
  }
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    body,
    { new: true, runValidators: true }
  );

  res.json(updatedBlog);
});

module.exports = blogsRouter;