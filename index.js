require("dotenv").config();

const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

// Utility function (for seeding users if needed)
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Home Page - Show total user count
app.get("/", (req, res) => {
  connection.query("SELECT COUNT(*) AS count FROM user", (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    let count = result[0].count;
    res.render("home", { count });
  });
});

// Show All Users
app.get("/user", (req, res) => {
  connection.query("SELECT * FROM user", (err, users) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    res.render("showuser", { users });
  });
});

// Edit User Page
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;

  connection.query("SELECT * FROM user WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    let user = result[0];
    res.render("edit", { user });
  });
});

// Update User
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass, username: newusername } = req.body;

  connection.query("SELECT * FROM user WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    let user = result[0];

    if (!user) {
      return res.send("User not found");
    }

    if (formpass !== user.password) {
      return res.send("Password is incorrect");
    }

    connection.query(
      "UPDATE user SET username = ? WHERE id = ?",
      [newusername, id],
      (err) => {
        if (err) {
          console.error(err);
          return res.send("Update failed");
        }

        res.redirect("/user");
      },
    );
  });
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
