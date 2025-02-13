const express = require("express");
const pg = require("pg");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcryptjs");

const connectionconf = require("./routes/bazapodataka");
const pool = connectionconf.pool;

// Kreirajte Express aplikaciju
const app = express();

// Kreirajte HTTP server za povezivanje s Express i Socket.IO
const server = http.createServer(app);

// Kreirajte instancu Socket.IO
const io = socketIo(server);

// Postavite port za server
const port = 3000;

// Postavite 'views' folder i EJS kao view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Staticki fajlovi (CSS, JS, slike) u 'public' folderu
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "routes/uploads")));

// Importujte rute
const chatKorisnik = require("./routes/chatKorisnik");
const chat = require("./routes/chat");
const prikazkandidata = require("./routes/prikazkandidata");
const mojeaplikacije = require("./routes/mojeaplikacije");
const statistika = require("./routes/statistika");
const konkursi = require("./routes/konkursi");
const pregledkonkursa = require("./routes/upravljajkonkursima");
const profiluser = require("./routes/profil");
const loginrouter = require("./routes/login");
const signuprouter = require("./routes/signup");
const pocetnarouter = require("./routes/pocetna");
const kreirajkonkurs = require("./routes/kreirajkonkurs");
const kandidati = require("./routes/kandidati");

app.use("/chat", chat);
app.use("/chatKorisnik", chatKorisnik);
app.use("/prikazkandidata", prikazkandidata);
app.use("/mojeaplikacije", mojeaplikacije);
app.use("/statistika", statistika);
app.use("/konkursi", konkursi);
app.use("/registracija", signuprouter);
app.use("/profil", profiluser);
app.use("/kreirajkonkurs", kreirajkonkurs);
app.use("/upravljajkonkursima", pregledkonkursa);
app.use("/pocetna", pocetnarouter);
app.use("/kandidati", kandidati);
app.use("/", loginrouter);

io.on("connection", (socket) => {
  console.log("Korisnik je spojen");

  socket.on("start-chat", (userId) => {
    console.log(`Chat sa korisnikom ${userId} je počeo`);
  });

 
  socket.on("new-message", async (data) => {
    try {
      
      const result = await pool.query(
        "SELECT ime, prezime FROM korisnici WHERE id_korisnika = $1",
        [data.fromUserId]
      );

      const senderName = result.rows[0]
        ? `${result.rows[0].ime}`
        : "Nepoznat korisnik";

   
      io.emit("receive-message", {
        message: data.message,
        sender: senderName, 
      });
    } catch (err) {
      console.error("Greška pri dohvaćanju imena pošiljatelja:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Korisnik je disconektovan");
  });
});

server.listen(port, () => {
  console.log(`Server radi na http://localhost:${port}`);
});
