const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const todosModel = require("./models").todo;

// get config vars
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3030;
const usersStatic = [
  {
    id: 1,
    name: "Hendar",
    hobby: "Eat",
    type_data: "premium",
  },
  {
    id: 2,
    name: "Dinata",
    hobby: "Sleep",
    type_data: "basic",
  },
  {
    id: 3,
    name: "Putra",
    hobby: "Reading",
    type_data: "premium",
  },
];

const dataUsers = [
  {
    user_id: 11,
    email: "hendar@gmail.com",
    password: "12345678",
    role: "admin",
  },
  {
    user_id: 12,
    email: "dinata@gmail.com",
    password: "12345678",
    role: "premium",
  },
  {
    user_id: 13,
    email: "putra@gmail.com",
    password: "12345678",
    role: "basic",
  },
];

let checkData = (req, res, next) => {
  // console.log(`Saya Mengecek Data Ini : ${req.body}`)
  next();
};

let checkUser = (req, res, next) => {
  let response = {};
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    response = {
      status: "ERROR",
      message: "Authorization Failed",
    };
    res.status(401).json(response);
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    console.log(error);
    if (error) {
      response = {
        status: "ERROR",
        message: error,
      };
      res.status(401).json(response);
      return;
    }
    req.user = user;
    next();
  });
};

app.use(checkData);

app.get("/", (req, res) => {
  res.send("Hello King & Queen, Ini Adalah Root");
});

app.get("/users", (req, res) => {
  res.json(usersStatic);
});

app.get("/users/:id", (req, res) => {
  let response = usersStatic[req.params.id - 1];
  res.json(response);
});

app.post("/users", (req, res) => {
  let response = {
    id: usersStatic.length + 1,
    name: req.body.name,
    hobby: req.body.hobby,
    type_data: req.body.type_data,
  };
  usersStatic.push(response);
  res.json(response);
});

app.put("/users/:id", (req, res) => {
  let incomingUpdateDate = {
    id: req.params.id,
    name: req.body.name,
    hobby: req.body.hobby,
    type_data: req.body.type_data,
  };
  usersStatic[req.params.id - 1] = incomingUpdateDate;

  res.json(usersStatic[req.params.id - 1]);
});

app.delete("/users/:id", (req, res) => {
  usersStatic.splice(req.params.id - 1, 1);
  res.status(204);
  res.send();
});

app.get("/todos", async (req, res) => {
  const todos = await todosModel.findAll();
  const response = {
    status: "SUCCESS",
    message: "Get All Todos",
    meta: {
      total: todos.length,
    },
    data: todos,
  };

  res.status(200).json(response);
  return;
});

app.get("/todos/:id", async (req, res) => {
  let response = {};
  const todos = await todosModel.findAll({
    where: {
      id: req.params.id,
    },
  });

  if (todos.length == 0) {
    response = {
      status: "SUCCESS",
      message: "Data not Found",
    };
  } else {
    response = {
      status: "SUCCESS",
      message: "Get Detail Todos",
      data: todos,
    };
  }

  res.status(200).json(response);
  return;
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let response = {};
  let foundUser = {};

  for (let i = 0; i < dataUsers.length; i++) {
    if (dataUsers[i].email == email) {
      foundUser = dataUsers[i];
    }
  }

  if (Object.keys(foundUser).length == 0) {
    response = {
      status: "ERROR",
      message: "User not Found",
    };
    res.status(401).json(response);
    return;
  }

  if (foundUser.password != password) {
    response = {
      status: "ERROR",
      message: "Combination Email and Password not Match",
    };
    res.status(401).json(response);
    return;
  }

  let jwt_payload = {
    user_id: foundUser.user_id,
  };

  let access_token = jwt.sign(jwt_payload, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
  response = {
    status: "SUCCESS",
    access_token: access_token,
  };
  res.json(response);
});

app.use(checkUser);

app.post("/todos", async (req, res) => {
  let response = {};
  let code = 200;
  if (req.body.title == "" || req.body.title == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "title cannot be blank",
    };
  }
  if (req.body.description == "" || req.body.description == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "description cannot be blank",
    };
  }
  try {
    const newTodos = await todosModel.create({
      title: req.body.title,
      description: req.body.description,
    });

    response = {
      status: "SUCCESS",
      message: "Create Todos",
      data: newTodos,
    };
  } catch (error) {
    code = 422;
    response = {
      status: "ERROR",
      message: error.parent.sqlMessage,
    };
  }

  res.status(code).json(response);
  return;
});

app.delete("/todos/:id", async (req, res) => {
  let response = {};
  let code = 200;
  try {
    const newTodos = await todosModel.create({
      title: req.body.title,
      description: req.body.description,
    });

    response = {
      status: "SUCCESS",
      message: "Create Todos",
      data: newTodos,
    };
  } catch (error) {
    code = 422;
    response = {
      status: "ERROR",
      message: error.parent.sqlMessage,
    };
  }

  res.status(code).json(response);
  return;
});

app.put("/todos/:id", async (req, res) => {
  let response = {};
  let code = 200;
  if (req.body.title == "" || req.body.title == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "title cannot be blank",
    };
  }
  if (req.body.description == "" || req.body.description == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "description cannot be blank",
    };
  }
  const todos = await todosModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!todos) {
    response = {
      status: "SUCCESS",
      message: "Data not Found",
    };
  } else {
    todos.title = req.body.title;
    todos.description = req.body.description;
    todos.save();
    response = {
      status: "SUCCESS",
      message: "Update Todos",
      data: todos,
    };
  }

  res.status(code).json(response);
  return;
});

app.listen(port, () => {
  console.log(`This Application Run on Port : ${port}`);
});
