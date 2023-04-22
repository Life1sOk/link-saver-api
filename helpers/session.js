const jwt = require("jsonwebtoken");
const redis = require("redis");

// const clientRedis = redis.createClient({ url: process.env.REDIS_URI });
const clientRedis = redis.createClient({
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

clientRedis.on("error", (err) => console.log("Redis Client Error", err));

clientRedis.connect();

// Забираем пользоватедя из редиса
const getUserIdByToken = async (token) => {
  const value = await clientRedis.get(token);
  return { success: true, user_id: value };
};

// Создаем токен
const createToken = (email) => {
  const jwtPayload = { email };
  let secret = process.env.JWT_SECRET || "Secret super";

  return jwt.sign(jwtPayload, secret);
};

// Пушим токен в редис стор
const setToken = async (token, id) => {
  return await clientRedis.set(token, id);
};

// Создаем сессию и отправляем промис с данными
const createSession = async (user) => {
  const { email, id } = user;
  const token = createToken(email);
  return setToken(token, id)
    .then(() => ({ success: true, user_id: id, token }))
    .catch(() => Promise.reject("fail set token"));
};

module.exports = {
  createSession,
  getUserIdByToken,
};
