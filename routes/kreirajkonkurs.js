var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');
const { client } = require('pg');

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

router.get('/',(req,res)=>{
    res.render('Admin/kreirajkonkurs')
})

router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});


router.post('/',async(req,res)=>{
    const{naziv,opis,lokacija,selectediskustvo,tip,selectedIds}=req.body
    let {datum}=req.body
    datum = new Date(); // Trenutni datum
    const year = datum.getFullYear();
    const month = String(datum.getMonth() + 1).padStart(2, '0'); // Dodajte 1 jer su meseci 0-indeksirani
    const day = String(datum.getDate()).padStart(2, '0');

const validandatum = `${year}-${month}-${day}`; // Formira "YYYY-MM-DD"
console.log(validandatum); // Primer: "2025-01-11"
    pool.connect((err,client,done)=>{
        if (err){
            return res.send(err)
        }


        const query='insert into konkurs(naziv,opis,lokacija,iskustvo,tip,obavezna_polja,rok_za_prijavu)values($1,$2,$3,$4,$5,$6,$7)'
        client.query(query,[naziv,opis,lokacija,selectediskustvo,tip,selectedIds,validandatum],(err,result)=>{
            done()
            if(err){
                console.log(err)
                res.json({succes:false,message:'Greška'})
            }
            else{
                console.log(selectedIds)
                res.json(({success:true,message:'uspijesno ste kreirali konkurs'}))
            }
        })
    })



})





module.exports=router