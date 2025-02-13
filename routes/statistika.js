var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');
const { generatePrime } = require('crypto');




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
    res.render('Admin/statistika')
})

router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});


router.get('/analiza',(req,res)=>{
    pool.connect((err,client,done)=>{
        if(err){
            console.log(err)
            res.json({success:false})
        }
        const query='select k.naziv,count(*) as broj_aplikanata,avg(vrijeme_popunjavanja) as prosjek from aplicirani_korisnici a join konkurs k on k.id_konkursa=a.id_konkursa group by k.naziv order by broj_aplikanata desc';
        client.query(query,(err,result)=>{
            done()
            if(err){
                console.log(err)
                res.json({success:false
                })
            }

            else{
                res.json({success:true,data:result.rows})
            }
        })
    })
})


router.get('/analizakandidata',(req,res)=>{
    pool.connect((err,client,done)=>{
        if(err){
            console.log(err)
            res.json({success:false})
        }
        const query='select k.ime,k.prezime,avg(ocjena) as prosjecna_ocjena from aplicirani_korisnici a join korisnici k on k.id_korisnika=a.id_korisnika group by k.ime,k.prezime order by prosjecna_ocjena desc';
        client.query(query,(err,result)=>{
            done()
            if(err){
                console.log(err)
                res.json({success:false
                })
            }

            else{
                res.json({success:true,data:result.rows})
            }
        })
    })
})




module.exports=router