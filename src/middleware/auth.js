const userRepository = require('../repositories/userRepository');

async function requireUser(req, res, next) {
  const userId = Number(req.header('x-user-id'));
  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header' });
  }
  const user = await userRepository.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unknown user' });
  }
  req.user = user;
  return next();
}

module.exports = { requireUser };
