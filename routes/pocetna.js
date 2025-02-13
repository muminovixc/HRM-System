const express=require('express')
const router=express.Router()




router.get('/',(req,res)=>{
    res.render('Admin/pocetna',{ime:'Edin'})
})


module.exports=router