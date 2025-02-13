var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require("./bazapodataka");
const bcrypt = require("bcryptjs");
const { createVerify } = require("crypto");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const pool = connectionconf.pool;
const fs = require("fs");
const e = require("express");

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

// Glavna ruta za prikaz kandidata
router.get("/", (req, res) => {
  const { id_korisnika, id_konkursa } = req.query;

  pool.connect((err, client, done) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Greska pri povezivanju sa bazom." });
    }

    const query = `
      SELECT row_number() OVER (ORDER BY ocjena DESC) AS pozicija, a.ocjena, a.ime, a.prezime, a.email, a.adresa, a.grad, a.drzava, 
             a.cv_data, a.motivaciono, a.datum_aplikacije, a.status_aplikacije, 
             k.github, k.edukacija
      FROM aplicirani_korisnici a
      JOIN korisnici k ON k.id_korisnika = a.id_korisnika
      WHERE a.id_korisnika = $1 AND a.id_konkursa = $2
    `;

    client.query(query, [id_korisnika, id_konkursa], (err, result) => {
      done();
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Greska pri izvrsavanju upita." });
      }

      const kandidat = result.rows[0];
      const datumAplikacije = new Date(kandidat.datum_aplikacije);
      const formattedDatum = datumAplikacije.toLocaleDateString("bs-BA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      let status = kandidat.status_aplikacije;

      const cvPath = kandidat.cv_data
        ? kandidat.cv_data.toString("base64")
        : null;

      if (status === "Prijavljen") {
        const query2 = `
            UPDATE aplicirani_korisnici 
            SET status_aplikacije = $1 
            WHERE id_korisnika = $2
          `;

        client.query(query2, ["Pregledan", id_korisnika], (err) => {
          if (err) {
            console.error("Greska pri azuriranju statusa:", err);
          } else {
            console.log('Status azuriran na "Pregledan".');
          }
        });
      }

      res.render("Admin/prikazkandidata", {
        ime: kandidat.ime,
        prezime: kandidat.prezime,
        email: kandidat.email,
        adresa: kandidat.adresa,
        grad: kandidat.grad,
        drzava: kandidat.drzava,
        cv: cvPath,
        motivaciono: kandidat.motivaciono,
        datum_aplikacije: formattedDatum,
        status_aplikacije: kandidat.status_aplikacije,
        edukacija: kandidat.edukacija,
        github: kandidat.github,
        id_korisnika,
        id_konkursa,
        ocjena: kandidat.ocjena,
        email2: kandidat.email,
        pozicija: kandidat.pozicija,
      });
    });
  });
});

// Ruta za pozivanje na intervju
router.post("/pozoviNaIntervju", async (req, res) => {
  const { datumVrijeme, email,id } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(er);
    }
    const query =
      "update aplicirani_korisnici set datum_intervjua=$1 where email=$2 and id_konkursa=$3";
    client.query(query, [datumVrijeme, email,id], (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  });

  const datumObjekt = new Date(datumVrijeme);

  // Formatirajte datum i vreme
  const datum = datumObjekt.toLocaleDateString("hr-HR"); // 20.01.2025
  const vrijeme = datumObjekt.toLocaleTimeString("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  }); // 15:30

  const naslov = "Poziv na intervju";
  const tekst = `Poštovani,\n\nPozvani ste na intervju koji će se održati dana ${datum} u ${vrijeme}. \nMolimo vas da nam potvrdite prisustvo na linku http://localhost:3000/mojeaplikacije.\n\nLijep pozdrav,\nVaš tim.`;

  try {
    const result = await sendEmail(email, naslov, tekst);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, poruka: "Došlo je do greške na serveru." });
  }
});

// Ruta za pozivanje na intervju
router.post("/odbij", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, poruka: "Nedostaju parametri." });
  }

  const naslov = "Poruka";
  const tekst = `Poštovani,\n\nNažalost ste odbijeni. \nViše sreće drugi put.\n\nLijep pozdrav,\nNode project.`;

  try {
    const result = await sendEmail(email, naslov, tekst);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, poruka: "Došlo je do greške na serveru." });
  }
});

router.get("/jwtAuth", authenticateToken, function (req, res, next) {
  return res.status(200);
});

router.post("/komentar", (req, res) => {
  const { komentar, id_korisnika, id_konkursa } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }

    const query =
      " UPDATE aplicirani_korisnici SET komentar = $1 WHERE id_korisnika = $2 AND id_konkursa = $3";
    client.query(
      query,
      [komentar, id_korisnika, id_konkursa],
      (err, result) => {
        done();
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          console.log("radi");
          res.json({ success: true });
        }
      }
    );
  });
});

router.post("/ocjena", (req, res) => {
  const { ocjena, id_korisnika, id_konkursa } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }

    const query =
      " UPDATE aplicirani_korisnici SET ocjena = $1 WHERE id_korisnika = $2 AND id_konkursa = $3";
    client.query(query, [ocjena, id_korisnika, id_konkursa], (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        console.log("radi");
        res.json({ success: true });
      }
    });
  });
});

router.put("/promjenastatusa", (req, res) => {
  const { status, email, id } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      res.json({ success: false });
    }

    const query2 = `
    UPDATE aplicirani_korisnici 
    SET status_aplikacije = $1 
    WHERE email = $2 and id_konkursa=$3
  `;

    client.query(query2, [status, email, id], (err) => {
      if (err) {
        console.error("Greska pri azuriranju statusa:", err);
      } else {
        console.log("Status azuriran.");
      }
    });
  });
});

router.post("/PodaciZaPdf", (req, res) => {
  const { id } = req.body;

  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    }
    const query =
      "select distinct a.cv_data,a.cv_ime,a.email, a.ime,a.prezime,a.adresa,a.grad,a.drzava,a.motivaciono,a.datum_aplikacije from aplicirani_korisnici a where a.id_korisnika=$1";
    client.query(query, [id], (err, result) => {
      done();
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        const userData = result.rows[0];
        const cvData = userData.cv_data; // Pretpostavljam da je ovo binarni podatak (BYTEA)
        const cvFileName = `${userData.cv_ime || "cv"}-${id}.pdf`;
        const cvFilePath = path.join(__dirname, "uploads", cvFileName);
        fs.writeFile(cvFilePath, cvData, (err) => {
          if (err) {
            console.log("Greška pri snimanju fajla:", err);
            return res.json({
              success: false,
              message: "Greška pri snimanju fajla.",
            });
          }

          const cvPath = `http://localhost:3000/uploads/${cvFileName}`;
          res.json({ success: true, cvPath, data: result.rows });
        });
      }
    });
  });
});

module.exports = router;
