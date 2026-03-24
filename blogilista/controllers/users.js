const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  if (!password || password.length < 3)
  {
    return res.status(400).json({
      error: 'password must be at least 3 characters long'
    });
  }
  try
  {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  }
  catch (error)
  {
    if (error.name === 'MongoServerError' && error.code === 11000)
    {
      return res.status(400).json({ error: 'username must be unique' });
    }
    res.status(400).json({ error: error.message });
  }
});

usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1 });
  res.json(users);
});

module.exports = usersRouter;