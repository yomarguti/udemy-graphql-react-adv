const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.getToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRATION_TOKEN,
  });
};

exports.getUser = (token) => {
  return new Promise((resolve, reject) => {
    try {
      const decodedUser = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
      User.findById(decodedUser._id)
        .then((user) => resolve(user))
        .catch((e) => resolve(null));
    } catch (error) {
      console.log(error);
      resolve(null);
    }
  });
};
