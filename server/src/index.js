// ---------------------------------
// Boilerplate Code to Set Up Server
// ---------------------------------

//WHEN YOU ARE RUNNING THINGS IN THINGS IN CONSOLE MAKE SURE YOU ARE IN SRC FOLDER THEN DO NODE INDEX.JS

//THE ONLY THING THAT WILL BE DIFFERENT WHEN WE CREATED DATA WILL BE DATABASE URL BUT THE BOILERPLATE BELOW WILL BE EXACTLY THE SAME
//importing Node Modules
import express from "express";
import pg from "pg"; //pg stands for PostgreSQL, which we need to connect to the database
import config from "./config.js"; //importing connection string to database hostedn on Neon

// new pg.Pool() is connecting to our PostgreSQL database, or db for short
const db = new pg.Pool({
  connectionString: config.databaseUrl, //credentials to access the database
  ssl: true, // use SSL encryption when connecting to the database to keep data safe
});

const app = express(); //create an instance of the Express module, which gives access to Express in its entirety.

app.use(express.json()); //This server will receive and respond to requests with JSON data

const port = 3000; //Setting which port for app to listen to and receive requests

app.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});

// ---------------------------------
// Helper Functions
// ---------------------------------

// 1. getAllAnimals()
async function getAllAnimals() {
  //db.query() lets us query the SQL database
  //takes in one parameter: a SQL query!
  const data = await db.query("SELECT * FROM animals ORDER BY id ASC");
  console.log(data.rows);
  return data.rows; // we have to use dot notation to get value of the rows property from the data object
}

// 2. getOneAnimalByName(name)
async function getOneAnimalByName(name) {
  //here Bee is hard coded so regardless of what we put in the URL it will only show data object for 'Bee'
  //Below is an example of the standard way to get back multiple types of data
  //   const data = await db.query(
  //     "SELECT * FROM animals WHERE name = $1 AND lives_in = $2 OR can_fly = $3",
  //     [name, lives_in, can_fly]
  //$ is used as a placeholder for values
  const data = await db.query("SELECT * FROM animals WHERE name = $1", [name]);
  return data.rows[0];
}

// 3. getOneAnimalById(id)
//looks up animal based on its id number
async function getOneAnimalById(id) {
  const data = await db.query("SELECT * FROM animals WHERE id = $1", [id]);
  return data.rows[0];
}

// 4. getNewestAnimal()
//grabs the most recently added animal based on descending order and highest id number
async function getNewestAnimal() {
  const data = await db.query("SELECT * FROM animals ORDER BY id DESC LIMIT 1");
  return data.rows[0];
}
// 5. deleteOneAnimal(id)
//this will remove one animal from data object based on the id number chosen
async function deleteOneAnimal(id) {
  const deletedAnimal = await db.query(
    "DELETE FROM animals WHERE id = $1 RETURNING *",
    [id]
  );
  return deletedAnimal.rows[0];
}
// 6. addOneAnimal(name, category, can_fly, lives_in)

async function addOneAnimal(name, category, can_fly, lives_in) {
  //here we are querying database and adding in sql code
  //db was declared in boilerplate code and connects to database and .query lets us write sql code to query database
  //Takes in 2 params: SQL command and array that contains dynamic values that we inject into the SQL command
  //SQL query needs to be written all in one line, using $1-$4 as placeholders for dynamic values
  await db.query(
    "INSERT INTO animals(name,category,can_fly,lives_in) VALUES($1, $2, $3, $4)",
    [name, category, can_fly, lives_in] //this should match the EXACT FORMAT AS WHATS IN YOUR query for the db.query
  );
}

// 7. updateOneAnimalName(id, newName)
//updates the name of an existing animal using id
async function updateOneAnimalName(id, newName) {
  await db.query("UPDATE animals SET name = $1 WHERE id = $2", [newName, id]);
}

// 8. updateOneAnimalCategory(id, newCategory)
//updates the category of an existing animal using id
async function updateOneAnimalCategory(id, newCategory) {
  await db.query("UPDATE animals SET category = $1 WHERE id = $2", [
    newCategory,
    id,
  ]);
}

// ---------------------------------
// API Endpoints
// ---------------------------------

// 1. GET /get-all-animals

//get method retrieves data from endpoint, we then use async await to wait for the results to actually process and then populate
app.get("/get-all-animals/", async (req, res) => {
  const animals = await getAllAnimals(); //calls helper function to get all animals from data base
  res.json(animals); //send data back as JSON
});

// 2. GET /get-one-animal-by-name/:name
app.get("/get-one-animal-by-name/:name", async (req, res) => {
  let name = req.params.name;

  const animal = await getOneAnimalByName(name);
  res.json(animal);
});

// 3. GET /get-one-animal-by-id/:id

app.get("/get-one-animal-by-id/:id", async (req, res) => {
  const id = req.params.id;
  const animal = await getOneAnimalById(id);
  res.json(animal);
});

// 4. GET /get-newest-animal
app.get("/get-newest-animal", async (req, res) => {
  const newestAnimal = await getNewestAnimal();
  res.json(newestAnimal);
});

// 5. POST /delete-one-animal/:id
app.post("/delete-one-animal/:id", async (req, res) => {
  const id = req.params.id;
  const deletedAnimal = await deleteOneAnimal(id);
  res.json(deletedAnimal);
});

// 6. POST /add-one-animal
//POST WILL ALWAYS BE USED IN POSTMAN.
//SHOULD BE RAW AND JSON

//app.post takes in same 2 parameters as app.get
app.post("/add-one-animal", async (req, res) => {
  //we access whatever was sent in request body and save it in this variable
  const animal = req.body;

  //DESTRUCTURING
  //take values from data object and insert into req.body
  const { name, category, can_fly, lives_in } = req.body;

  //console log will show value/response of body (data object) in terminal
  console.log(animal);
  //here we are not creating a variable because the helper function is not getting data that needs to be returned (the response will just be a sucess message)
  //this would be end result WITH destructuring
  await addOneAnimal(name, category, can_fly, lives_in);

  //Here the response should be a success message so we use res.send() to send text
  res.send(`Sucess! Animal was added.`);
});

// 7. POST /update-one-animal-name

app.post("/update-one-animal-name", async (req, res) => {
  const { id, newName } = req.body;

  await updateOneAnimalName(id, newName);

  res.send(`Success! Animal was updated.`);
});
// 8. POST /update-one-animal-category

app.post("/update-one-animal-category", async (req, res) => {
  const { id, newCategory } = req.body;
  await updateOneAnimalCategory(id, newCategory);

  res.send(`Success! Animal category was updated.`);
});
