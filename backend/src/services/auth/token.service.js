import jwt from 'jsonwebtoken';
import config from '../../config/env.config.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

export const createAuthResponse = async (user) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    token,
    refreshToken,
    user: safeUser
  };
};