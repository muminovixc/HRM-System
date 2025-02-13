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
    res.render('Admin/kandidati')
})

router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});

router.get('/options',async(req,res)=>{
    pool.connect((err,client,done)=>{
        
        if(err){
            console.log('ne radii')
            return res.status(500).json({success:false, message:'greska'})
        }

        const query='select * from konkurs';
        client.query(query,(err,result)=>{
            done();
            if(err){
                console.log('ne radi')
                return res.status(500).json({success:false, message:'greska'})
            }
            else{
                console.log(' radi')
                res.json({success:true,data:result.rows})
            }
        })
    })
})


router.post('/prikaz',(req,res)=>{
    const{id}=req.body

    pool.connect((err,client,done)=>{
        if(err){
            console.log(err)
            return res.status(500).json({success:false, message:'greska'})
        }

        const query='select * from aplicirani_korisnici where id_konkursa=$1';
        client.query(query,[id],(err,result)=> {
            done();
            if(err){
                console.log(err)
                return res.status(500).json({success:false, message:'greska'})
            }
            else {
                const userData = result.rows;
                
                // Ako imate binarne podatke kao što je `cv`, konvertujte ih u Base64
                if (userData.cv_data) {
                    userData.cv_data = userData.cv_data.toString('base64');
                }
            
                res.json({ success: true, data: userData });
            }
        })
    })
})



module.exports=router




