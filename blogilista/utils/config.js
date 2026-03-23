const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test')
{
  dotenv.config({ path: '.env.test' });
}
else
{
  dotenv.config();
}

const PORT = process.env.PORT;
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
  PORT,
  MONGODB_URI
};
