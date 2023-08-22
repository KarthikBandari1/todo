const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//list of all todos
app.get("/todos/", async (request, response) => {
  const { status, priority, searchw = "" } = request.query;
  if (status !== undefined && priority === undefined) {
    query_ = `select * from todo where todo like '%${searchw}%' and status like '%${status}%;`;
  } else if (status === undefined && priority !== undefined) {
    query_ = `select * from todo where  todo like '%${searchw}%' and priority like '%${priority}%;`;
  } else if (status !== undefined && priority !== undefined) {
    query_ = `select * from todo where  todo like '%${searchw}%' and status like '%${status}% and  priority like '%${priority}% ;`;
  }
  const result = await db.all(query_);
  response.send(result);
});

//getting a single todo
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query_ = `select * from todo where id=${todoId}`;
  const result = await db.all(query_);
  response.send(result);
});

//creating a todo
app.post("/todos/", async (request, response) => {
  const query_ = `insert into todo values(4,"EATING","HIGH","DONE");`;
  await db.run(query_);
  response.send("Todo Successfully Added");
});

//updating
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  if (todo !== undefined) {
    const query_ = `update todo set todo='${todo}' where id=${todoId};`;
    await db.run(query_);
    response.send("Todo Updated");
  } else if (status !== undefined) {
    const query_ = `update todo set status='${status}' where id=${todoId};`;
    await db.run(query_);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const query_ = `update todo set priority='${priority}' where id=${todoId};`;
    await db.run(query_);
    response.send("Priority Updated");
  }
});

//delete
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query_ = `delete from todo where id=${todoId}`;
  const result = await db.run(query_);
  response.send("Todo Deleted");
});
