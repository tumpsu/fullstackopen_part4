const dummy = (/*blogs*/) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0)
  {
    return null;
  }

  return blogs.reduce((fav, blog) => {
    return blog.likes > fav.likes ? blog : fav;
  });
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0)
  {
    return null;
  }

  const counts = {};

  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1;
  });

  const topAuthor = Object.keys(counts).reduce((max, author) => {
    return counts[author] > counts[max] ? author : max;
  });

  return {
    author: topAuthor,
    blogs: counts[topAuthor]
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
};
