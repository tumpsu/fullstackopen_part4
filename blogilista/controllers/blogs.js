const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  try
  {
    const body = req.body;
    if (!req.token)
    {
      return res.status(401).json({ error: 'token missing' });
    }
    let decodedToken;
    try
    {
      decodedToken = jwt.verify(req.token, process.env.SECRET);
    }
    catch
    {
      return res.status(401).json({ error: 'token invalid' });
    }
    if (!decodedToken.id)
    {
      return res.status(401).json({ error: 'token invalid' });
    }

    const user = await User.findById(decodedToken.id);
    if (user.length === 0)
    {
      return res.status(400).json({ error: 'no users in database' });
    }
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    });
    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    res.status(201).json(savedBlog);
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