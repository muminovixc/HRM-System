
document.getElementById('prijava').addEventListener('click',async(e)=>{
    e.preventDefault()

        const email=document.getElementById('email').value
        const sifra=document.getElementById('sifra').value
        const poruka=document.getElementById('poruka')
        const porukae=document.getElementById('porukae')

        console.log(email)
        console.log(sifra)

        if(!email||!sifra){
            poruka.innerHTML='Sva polja moraju biti popunjena!';
        }

         if(!email.includes("@")){
            porukae.innerHTML='Nepravilno unesen Email'

        }

        if(sifra.length<8){
            poruka.innerHTML='Poruka mora sadržavati najmanje 8 karaktera!'
        }
    


       try{
        
        const res=await fetch('http://localhost:3000/',{
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,sifra})
        })
        const data = await res.json();



        if(data.success==false){
            console.log('greska')
            poruka.innerHTML=data.message
            return;
        }
        else{

            localStorage.setItem('jwt',data.token)
            const decodedtoken=jwtDecode(data.token);
            const role=decodedtoken.role
            console.log(decodedtoken.role)
            console.log(decodedtoken.ime)
                
                if(role=='korisnik'){
                    const id=decodedtoken.id
                    console.log(id)
                    localStorage.setItem('id',id)
                   const ime=decodedtoken.ime;
                   console.log(ime)
                    localStorage.setItem('ime',ime);
                    location.assign('http://localhost:3000/profil')
                }

               else if(role=='admin'){
                const id=decodedtoken.id
                    console.log(id)
                    localStorage.setItem('id',id)
                    const ime=decodedtoken.ime;
                    localStorage.setItem('ime',ime)
                    location.assign('http://localhost:3000/upravljajkonkursima')
                }
                
               
            
        }

       }
       catch (error) {
        console.error('Greška pri komunikaciji sa serverom:', error);
        poruka.innerHTML = error;
    }

            

        })