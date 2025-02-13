const express = require('express');
const router = express.Router();
const connectionconf = require('./bazapodataka');
const bcrypt = require('bcryptjs');
const pool = connectionconf.pool;
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const token_secret_key = crypto.randomBytes(32).toString('hex'); 
console.log

router.get('/', (req, res) => {
    res.render('LandingPage/prijava');
});

router.post('/', async (req, res) => {
    const { email, sifra } = req.body;
    console.log(req.body);


    try {
        const client = await pool.connect();
        const query = 'SELECT ID_korisnika,sifra,ime,user_role FROM korisnici WHERE email = $1';
        const result = await client.query(query, [email]);
        const data = result.rows[0]


        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Korisnik sa ovim emailom nije pronađen.' });
        }

        const isValidPassword = await bcrypt.compare(sifra, data.sifra);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Neispravna šifra.' });
        }
        else{
            const payload={
                id:data.id_korisnika,
                email:data.email,
                role: data.user_role,
                ime: data.ime
            }
            const token=jwt.sign(payload,token_secret_key)
            res.json({ success: true, message: 'Uspješno ste se prijavili.',token});}
            console.log('ssssss')

        
    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
