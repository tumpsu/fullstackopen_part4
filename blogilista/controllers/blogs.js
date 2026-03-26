const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  try
  {
    const user = req.user;
    const body = req.body;
    if (!req.user)
    {
      return res.status(401).json({ error: 'token missing or invalid' });
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

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res) => {
  const user = req.user;

  if (!user)
  {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog)
  {
    return res.status(404).json({ error: 'blog not found' });
  }

  if (!blog.user)
  {
    return res.status(400).json({ error: 'blog has no user field' });
  }

  if (blog.user.toString() !== user._id.toString())
  {
    return res.status(403).json({ error: 'only the creator can delete this blog' });
  }

  await Blog.findByIdAndDelete(req.params.id);
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