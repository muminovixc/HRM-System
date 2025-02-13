const express = require("express");
const connectionconf = require("./bazapodataka");
const { Client } = require("pg");
const jwt = require("jsonwebtoken");
const pool = connectionconf.pool;

const router = express.Router();

function authenticateToken(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  console.log(token);

  if (token === undefined || token === "null") {
    const error = { message: "Nemate dozvolu za pristup" };
    return res.status(401).send(error.message);
  }

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ error: "Nevažeći token" });
    }

    next();
  });
}

router.get("/", async (req, res) => {
  res.render("Admin/chat");
});
router.get("/jwtAuth", authenticateToken, function (req, res, next) {
  return res.status(200);
});

router.get("/users", async (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
    }
    const query = "select ime,prezime,id_korisnika from korisnici";
    client.query(query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json({ success: true, data: result.rows });
      }
    });
  });
});

// Ruta za slanje poruka - može biti opcionalna ako želite da snimite poruke u bazu
router.post("/send-message", async (req, res) => {
  const { fromUserId, toUserId, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO poruke(posaljitelj_id,primatelj_id, poruka) VALUES($1, $2, $3)",
      [fromUserId, toUserId, message]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Greška pri slanju poruke:", err);
    res
      .status(500)
      .json({ success: false, message: "Greška pri slanju poruke" });
  }
});

router.get("/get-messages", async (req, res) => {
  const { fromUserId, toUserId } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
                 p.poruka, 
                 k.ime, 
                 k.prezime 
              FROM poruke p 
              JOIN korisnici k 
              ON k.id_korisnika = p.posaljitelj_id
              WHERE (p.posaljitelj_id = $1 AND p.primatelj_id = $2) 
              OR (p.posaljitelj_id = $2 AND p.primatelj_id = $1)
              ORDER BY p.datum ASC`,
      [fromUserId, toUserId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("Greška pri dohvaćanju poruka:", err);
    res.json({ success: false, error: "Greška pri dohvaćanju poruka" });
  }
});


module.exports = router;
