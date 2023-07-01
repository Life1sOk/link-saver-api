const compareHash = (bcrypt, password, hash) => {
  return bcrypt.compareSync(password, hash.replace(/slash/g, "/"));
};

const createHash = (bcrypt, password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt).replace(/\//g, "slash");
};

module.exports = {
  compareHash,
  createHash,
};
