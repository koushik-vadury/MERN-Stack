require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const app = express();
const auth = require("./middleware/auth");

require("./db/conn");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const Employe_Registration = require("./models/user-registrations");

const hbs = require("hbs");
const { JsonWebTokenError } = require("jsonwebtoken");
const { send } = require("process");
hbs.registerPartials(path.join(__dirname, "../templates/partials"));

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));

// all routers start
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(401).send(error);
  }
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/registration", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (password === cpassword) {
      const member = new Employe_Registration({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        age: req.body.age,
        email: req.body.email,
        password: password,
        cpassword: cpassword,
        gender: req.body.gender,
      });

      const token = await member.generateAuthToken();
      console.log(`The Token Is ${token}`);
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 300000),
        httpOnly: true,
      });
      const registered_member = await member.save();
      res.status(200).send(registered_member);
    } else {
      res.send("password are not matched !!");
    }
  } catch (err) {
    res.status(400).send();
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const registered = await Employe_Registration.findOne({ email });

    const isMatch = await bcrypt.compare(password, registered.password);

    const token = await registered.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true,
    });

    if (isMatch) {
      res.status(200).render("index");
    } else {
      res.status(404).send("Opps , Password Are Not Match !!!");
    }
  } catch (err) {
    res.status(400).send("invalid Email !!!");
  }
});

app.get("*", (req, res) => {
  res.render("error");
});

// all routers end

app.listen(port, () => {
  console.log(`server is connected and post no ${port}`);
});
