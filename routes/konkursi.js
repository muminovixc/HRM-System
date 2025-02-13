const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');
const e = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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

router.get('/podaci', async (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Greška sa konekcijom na bazu' });
        }

        const query = 'SELECT * FROM konkurs where rok_za_prijavu>= current_date';
        client.query(query, (err, result) => {
            done();
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Greška sa upitom ka bazi' });
            }
            res.json({ success: true, data: result.rows });
        });
    });
});

router.get('/',(req,res)=>{
        res.render('Korisnik/konkursi')
})


router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});


router.post('/detalji',(req,res)=>{
    const {jobId}=req.body
    console.log(jobId)
    pool.connect((err,client,done)=>{
        if(err){
            console.log('ne radi')
        }

        const query='select * from konkurs where id_konkursa=$1';
        client.query(query,[jobId],(err,result)=>{
            done()
            if (err){
                console.log('ne radi')
            }
            else{
                console.log('radi')
                res.json({success:true,data:result.rows})
            }
        })
    })
})


router.post('/filter',(req,res)=>{
    const {select1,select2}=req.body
 
    pool.connect((err,client,done)=>{
        if(err){
            console.log('ne radi')
        }

        const query='select * from konkurs where lokacija=$1 and iskustvo=$2';
        client.query(query,[select1,select2],(err,result)=>{
            done()
            if (err){
                console.log('ne radi')
            }
            else{
                console.log('radi')
                res.json({success:true,data:result.rows})
            }
        })
    })
})




router.post('/apliciraj',upload.single('cv'), async (req, res) =>{
    
        const {id_korisnika,id_konkursa, ime, prezime, email, grad, adresa, drzava, motivaciono,vrijeme } = req.body;
        const cv = req.file; // Fajl prenet iz FormData
        
   
        pool.connect((err,client,done)=>{
            if(err){
                console.log('ne radi')
            }
        // SQL upit za unos podataka u bazu
        const query = `
          INSERT INTO aplicirani_korisnici(id_korisnika,id_konkursa,ime, prezime, email, grad, adresa, drzava, motivaciono, cv_data, cv_ime,vrijeme_popunjavanja)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12)
        `;
        const values = [
          id_korisnika,
          id_konkursa,
          ime,
          prezime,
          email,
          grad || null,
          adresa || null,
          drzava || null,
          motivaciono || null,
          cv ? cv.buffer : null, // Čuvanje fajla kao BYTEA
          cv ? cv.originalname : null, // Originalni naziv fajla
          vrijeme || null
        ];

        client.query(query,values,(err,result)=>{
            done()
                if(err){
                    console.log('ne radi',err)
                    res.json({success:false})
                                }
                    else
                    {
                        console.log('radi')
                        res.json({success:true})
                    }


        })
      
    });
});

module.exports=router;