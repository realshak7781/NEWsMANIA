
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import axios from "axios";

const app = express();
const port = 3000;
const saltRounds=10;

const db = new pg.Client({
  host: process.env.DB_HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,});
  db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/",(req,res)=>{
    res.render("startPage.ejs");
});

app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.get("/login",(req,res)=>{
    res.render("login.ejs");
});


app.get('/news', async (req, res) => {
  const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=100&apiKey=${process.env.API_KEY}`;



  try {
    const response = await axios.get(url);
    const data=response.data;
    
      // Filter articles for each specific source
  const HT = data.articles.filter(article => 
    article.author === 'Hindustan Times'
  );
  
  const LL = data.articles.filter(article => 
    article.author === 'Live Law - Indian Legal News'
  );
  
  const MC = data.articles.filter(article => 
    article.author === 'Moneycontrol'
  );
console.log(MC);
  res.render('news.ejs',{
    HT:HT,
    LL:LL,
    MC:MC
  });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post("/register",async(req,res)=>{
   const user=req.body.username;
   const password=req.body.password;

   try {
    const userCheck = await db.query("SELECT * FROM users WHERE username = $1", [user]);
    if (userCheck.rows.length > 0) {
        res.send("Username already exists");
      } else {
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [user, hashedPassword]);
        res.redirect("/login");
      }
   } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
   }
});

app.post("/login",async(req,res)=>{
    const user=req.body.username;
    const password=req.body.password;

    try {
      const userCheck=await db.query("SELECT * FROM users WHERE username = $1", [user]);
      if (userCheck.rows.length === 0) {
        res.send("Please sign Up");
      }
      else{
        res.redirect("/news");
      }
    } catch (error) {
      console.log(error);
    }
 });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


