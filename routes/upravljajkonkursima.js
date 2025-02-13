var express = require('express');
var router = express.Router();
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

router.get('/',(req,res)=>{
    res.render('Admin/upravljajkonkursima')
})

router.get('/jwtAuth', authenticateToken, function(req, res, next) {

    return res.status(200);
});




router.get('/uzimanjepodataka', async (req, res) => {
    pool.connect((err, client, done) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Greška sa konekcijom na bazu' });
        }

        const query = 'SELECT * FROM konkurs';
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


router.get('/pregledkonkursa',async(req,res)=>{
    pool.connect((err,client,done)=>{
        if(err){
            return res.status(500).json({success:false, message:'greska'})
        }

        const query='select * from konkurs';
        client.query(query,(err,result)=>{
            done();
            if(err){
                return res.status(500).json({success:false, message:'greska'})
            }
            else{
                res.json({success:true,data:result.rows})
            }
        })
    })
})


router.post('/filtriraj',async(req,res)=>{

    const{tip2}=req.body

    pool.connect((err,client,done)=>{
        if(err){
            return res.status(500).json({success:false, message:'greska'})
        }

        const query='select * from konkurs where status=$1';
        client.query(query,[tip2],(err,result)=>{
            done();
            if(err){
            
                return res.status(500).json({success:false, message:'greska'})
            }
            else{
                console.log(result.rows)
                res.json({success:true,data:result.rows})
            }
        })
    })
})

router.post('/pretrazi',async(req,res)=>{
        const{NazivKonkursa}=req.body

        pool.connect((err,client,done)=>{
            if(err){
    
                return res.status(500).json({success:false,message:'greška'})
            }

            const query='select * from konkurs where naziv=$1';
            client.query(query,[NazivKonkursa],(err,result)=>{
                done();
                if(err){
            
                    return res.status(500).json({success:false,message:'Ne postoji konkurs sa tim imenom'})
                }
                else{
                  
                    res.json({success:true,data:result.rows})
                }
            })

        })

})

router.post('/arhiviraj',async(req,res)=> {
    const { status, id} = req.body;
    console.log(status,id)

    pool.connect((err,client,done)=>{
        if(err){

            return res.status(500).json({success:false,message:'greška'})
        }

        const query='UPDATE konkurs SET status = $1 WHERE id_konkursa = $2';
        client.query(query,[status,id],(err,result)=>{
            done();
            if(err){
        
                return res.status(500).json({success:false,message:'Ne postoji konkurs sa tim imenom'})
            }
            else{
              
                res.json({success:true})
            }
        })

    })


})

router.post('/aktiviraj',async(req,res)=> {
    const { status, id,noviDatum} = req.body;
    pool.connect((err,client,done)=>{
        if(err){

            return res.status(500).json({success:false,message:'greška'})
        }

        const query='UPDATE konkurs SET status = $1,rok_za_prijavu=$2 WHERE id_konkursa = $3';
        client.query(query,[status,noviDatum,id],(err,result)=>{
            done();
            if(err){
                return res.status(500).json({success:false,message:'Ne postoji konkurs sa tim imenom'})
            }
            else{
                res.json({success:true})
            }
        })

    })

})

router.post('/kreirajPDF',async(req,res)=>{
    const{id}=req.body

    pool.connect((err,client,done)=>{
        if(err){

            return res.status(500).json({success:false,message:'greška'})
        }

        const query='select * from konkurs where id_konkursa=$1';
        client.query(query,[id],(err,result)=>{
            done();
            if(err){
        
                return res.status(500).json({success:false,message:'Ne postoji konkurs sa tim imenom'})
            }
            else{
              
                res.json({success:true,data:result.rows})
            }
        })

    })

})

module.exports=router