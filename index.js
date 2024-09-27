import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "<usename>",
  password: "<password>",
  database: "<Database name>",
  host: "localhost",
  port: 5432
});
db.connect();


let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try{
    const result = await db.query("select * from items;");
    items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  }catch(e){
    console.log(e);
  }
});


app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try{
    const result = await db.query("insert into items (title) values ($1) returning *;",[item]);
    items = result.rows;
  } catch(e){
    console.log(e);
  }
  res.redirect("/");
});

app.post("/edit", (req, res) => {

  const id = req.body["updatedItemId"];
  const title = req.body["updatedItemTitle"];
  console.log(id); console.log(title);

  try{
    const result = db.query(
      "update items set title = ($1) where id = ($2) returning *;",[title, id]);
    items = result.rows;
  }catch(e){
    console.log(e);
  }
  res.redirect("/");

});

app.post("/delete", async (req, res) => {

  const id = req.body["deleteItemId"];
  try{
    const result = await db.query("delete from items where id = ($1) returning *;",[id]);
    items = result.rows;
  } catch(e){
    console.log(e);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
