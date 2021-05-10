const Employe_Registration = require("../models/user-registrations");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const Verifyuser = jwt.verify(token, process.env.SECRET_KEY);
    const user = await Employe_Registration.findById({ _id: Verifyuser._id });

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(401).send(err);
  }
};

module.exports = auth;
