const express = require('express');
const router = express.Router();
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const saltRound=10
const pool = connectionconf.pool;



const getHashedPassword= async (plainPassword)=>{
        try{
             const salt=await bcrypt.genSalt(saltRound)   
            const hashedPassword= await bcrypt.hash(plainPassword,salt)
            return hashedPassword
        }catch(err){
                throw err
        }
}

router.get('/', (req, res) => {
    res.render('LandingPage/registracija');
});

router.post('/', async (req, res) => {
        
    const { ime, prezime, email, sifra } = req.body;
       const hashedPassword1=await getHashedPassword(sifra)
    
    

    pool.connect((err,client,done)=>{
        if(err){
            return res.send(err);
        }
    
    

    const query='insert into korisnici(ime,prezime,email,sifra) values ($1,$2,$3,$4)'
    client.query(query,[ime,prezime,email,hashedPassword1],(err,result)=>{
        done();
        if(err){
            res.json(({success: false, message:'Račun već postoji'}))
        
        }
        else
        {
           res.json(({success:true,message:'Uspijesno ste kreirali račun!'}))
        }
    })
})

});


module.exports = router;
