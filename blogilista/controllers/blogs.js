const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  try
  {
    const user = req.user;
    const body = req.body;
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
  const user = req.user;
  const blog = await Blog.findById(req.params.id);

  if (!blog)
  {
    return res.status(404).json({ error: 'blog not found' });
  }

  if (blog.user.toString() !== user._id.toString())
  {
    return res.status(403).json({ error: 'only the creator can delete this blog' });
  }

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