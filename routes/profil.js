const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');

const pool = connectionconf.pool;


function authenticateToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log(token)

    if (token === undefined || token === "null") {
        const error = {message: "Nemate dozvolu za pristup"}
        return res.status(401).send(error.message);
    }

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.json({error: "Nevažeći token"})
        }

        next()
    })

}

router.get('/', (req, res) => {
    res.render('Korisnik/profil',);
});

router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});


router.post('/podaci',(req,res)=>{
    const {id}=req.body;
    console.log(id)

    pool.connect((err,client,done)=>{
        if(err){
            console.log(err)
            return res.status(500).json({success:false,message:'greška'})
        }
        const query='select ime,prezime,username,email,cv,github,edukacija from korisnici where id_korisnika=$1';
        client.query(query,[id],(err,result)=>{
            done();
            if(err){
                console.log(err)
        
                return res.status(500).json({success:false,message:'Ne postoji korisnik sa tim id'})
            }
            else {
                console.log('radi profil')
                const userData = result.rows[0];
                if (userData.cv) {
                    userData.cv = userData.cv.toString('base64');
                }
            
                res.json({ success: true, data: userData });
            }
            
        })

    })
})

const multer = require('multer');
const upload = multer();

router.put('/azuriranje', upload.single('cv'), (req, res) => {
  const { ime, prezime, username, vjestine, github,edukacija, id } = req.body;
  const cv = req.file ? req.file.buffer : null; 
    console.log(ime,prezime,username,vjestine,github)
  pool.connect((err, client, done) => {
    if (err) {
      console.error('Greška pri povezivanju s bazom:', err);
      return res.status(500).json({ success: false, message: 'Greška pri povezivanju s bazom' });
    }

    const query = `
      UPDATE korisnici
      SET 
          ime = COALESCE($1, ime),
          prezime = COALESCE($2, prezime),
          username = COALESCE($3, username),
          vjestine = COALESCE($4, vjestine),
          github = COALESCE($5, github),
          cv = COALESCE($6, cv),
          edukacija = COALESCE($7, edukacija)
      WHERE id_korisnika = $8;
    `;

    client.query(query,  [ime || undefined, prezime || undefined,username || undefined,vjestine || undefined,github || undefined,cv || undefined,edukacija || undefined,id], (err, result) => {
      done();
      if (err) {
        console.error('Greška pri izvršavanju upita:', err);
        return res.status(500).json({ success: false, message: 'Greška pri ažuriranju podataka' });
      }
      res.json({ success: true });
    });
  });
});




module.exports=router;