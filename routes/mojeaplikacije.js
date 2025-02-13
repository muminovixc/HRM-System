const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require("./bazapodataka");
const bcrypt = require("bcryptjs");
const e = require("express");
const multer = require("multer");
const { Client } = require("pg");
const { route } = require("./upravljajkonkursima");
const upload = multer({ storage: multer.memoryStorage() });
const nodemailer = require("nodemailer");
const pool = connectionconf.pool;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendEmail = async (email, naslov, tekst) => {
  if (!email || !email.includes("@")) {
    throw new Error("Neispravna email adresa.");
  }

  const mailOptions = {
    from: "nodeprojekattest@gmail.com",
    to: email,
    subject: naslov,
    text: tekst,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email poslan: ${info.response}`);
    return { success: true, poruka: "Email uspješno poslan!" };
  } catch (error) {
    console.error(`Greška pri slanju emaila: ${error.message}`);
    return {
      success: false,
      poruka: "Došlo je do greške prilikom slanja emaila.",
    };
  }
};

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
router.get("/", (req, res) => {
  res.render("Korisnik/mojeaplikacije");
});

router.get("/jwtAuth", authenticateToken, function (req, res, next) {
  return res.status(200);
});

router.post("/prikazaplikacija", (req, res) => {
  const { id } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }

    const query =
      "select DISTINCT a.email, a.id_aplikacije, k.naziv,a.status_aplikacije,k.iskustvo,a.datum_aplikacije,k.id_konkursa from konkurs k join aplicirani_korisnici a on a.id_konkursa=k.id_konkursa where a.id_korisnika=$1";
    client.query(query, [id], (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true, data: result.rows });
      }
    });
  });
});

router.post("/prikazidetalje", (req, res) => {
  const { id } = req.body;

  console.log(id);

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }

    const query = "select * from aplicirani_korisnici where id_aplikacije=$1";
    client.query(query, [id], (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true, data: result.rows });
      }
    });
  });
});

router.post("/otkaziaplikaciju", (req, res) => {
  const { id } = req.body;
  const status = "Otkazan";

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }
    const query =
      "update aplicirani_korisnici set status_aplikacije=$1 where id_aplikacije=$2";
    client.query(query, [status, id], (err, result) => {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    });
  });
});
router.post("/potvrdidolazak", async (req, res) => {
  const { id, email } = req.body;
  const status = "Potvrdio dolazak na intervju";

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      return res.json({ success: false }); 
    }

    const query =
      "UPDATE aplicirani_korisnici SET status_aplikacije=$1 WHERE id_aplikacije=$2";
    client.query(query, [status, id], async (err, result) => {
      done(); // Završite sa radom sa bazom

      if (err) {
        console.log(err);
        return res.json({ success: false }); // Odmah šaljemo odgovor u slučaju greške pri izvršavanju upita
      }
      console.log(email);

      // Ako je upit uspešan, šaljemo email
      const naslov = "Poruka";
      const tekst = `Poštovani,\n\nDrago nam je da ste potvrdili svoj dolazak. \nvidimo se uskoro na tehničkom intervju.\n\nLijep pozdrav,\nNode project.`;

      try {
        const result = await sendEmail(email, naslov, tekst);
        res.json({success:true}); 
      } catch (error) {
        console.error(error.message);
        res
          .status(500)
          .json({ success: false, poruka: "Došlo je do greške na serveru." });
      }
    });
  });
});

router.post("/filtriraj", (req, res) => {
  const { id, status } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }
    const query =
      "select a.email,a.id_aplikacije, k.naziv,a.status_aplikacije,k.iskustvo,a.datum_aplikacije,k.id_konkursa from konkurs k join aplicirani_korisnici a on a.id_konkursa=k.id_konkursa where a.id_korisnika=$1 and status_aplikacije=$2";
    client.query(query, [id, status], (err, result) => {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true, data: result.rows });
      }
    });
  });
});

module.exports = router;
