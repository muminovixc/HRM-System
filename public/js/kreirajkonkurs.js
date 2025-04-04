
  document.addEventListener('DOMContentLoaded', async () =>{

    const jwtToken = localStorage.getItem('jwt')
    console.log(jwtToken)
    const res1 = await fetch('/kreirajkonkurs/jwtAuth', {
        method: 'GET',
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`}
    })
    if (!res1.ok) {
      localStorage.removeItem('jwt');
      location.assign('/')
  }

  const ime1=localStorage.getItem('ime')
            console.log('ime'+ime1)

          const  ime=document.getElementById('ime');

            ime.innerHTML=ime1


    
  document.getElementById("kreirajkonkurs").addEventListener('click',async(e)=>{
    e.preventDefault()
    const poruka=document.getElementById('poruka')
    const porukan=document.getElementById('porukan')
    const porukao=document.getElementById('porukao')
    const porukal=document.getElementById('porukal')
    const porukat=document.getElementById('porukat')
    const porukai=document.getElementById('porukai')



        const ime=document.getElementById('ime')
        const prezime=document.getElementById('prezime')
        const email=document.getElementById('email')
        const adresa=document.getElementById('adresa')
        const grad=document.getElementById('grad')
        const drzava=document.getElementById('drzava')
        const cv=document.getElementById('cv')
        const motivaciono=document.getElementById('motivaciono')
    
        const naziv=document.getElementById('naziv').value
        const opis=document.getElementById('opis').value
        const lokacija=document.getElementById('lokacija').value
        const tip=document.getElementById('tip').value
        const datum=document.getElementById('datum_trajanja')

        const iskustvo= document.querySelectorAll('input[name="iskustvo"]:checked');
        const selectediskustvo = Array.from(iskustvo).map(checkbox => checkbox.value);


      
        const checkedBoxes = document.querySelectorAll('input[name="skills"]:checked');
        const selectedIds = Array.from(checkedBoxes).map(box => box.id);

        console.log( selectedIds);
      
       
      

        if (selectedIds.length===0){
          poruka.innerHTML='Morate odabrati obavezna polja'
          poruka.style.backgroundColor='red'
          poruka.style.color='white'
          poruka.style.marginBottom='5px'
          
        }

        if(naziv==''){
          porukan.innerHTML='Polje naziv ne smije biti prazno!'
          porukan.style.backgroundColor='red'
          porukan.style.color='white'
        }

        if(opis==''){
          porukao.innerHTML='Polje opis ne smije biti prazno!'
          porukao.style.backgroundColor='red'
          porukao.style.color='white'
        }

        if(lokacija==''){
          porukal.innerHTML='Polje Lokacija ne smije biti prazno!'
          porukal.style.backgroundColor='red'
          porukal.style.color='white'
        }

        if(selectediskustvo.length==0){
          porukai.innerHTML='Morate odabrati iskustvo kandidata!'
          porukai.style.backgroundColor='red'
          porukai.style.color='white'

        }

        else if(!naziv||!opis||!lokacija){
          console.log('ffiwh')
        }

        else{
          const res=await fetch('/kreirajkonkurs',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({naziv,opis,lokacija,selectediskustvo,tip,datum,selectedIds})
          })

          const data=await res.json();
          console.log(data)

          if(data.success==true){
            modernModal.style.display = "flex";
            document.getElementById('zatvori').addEventListener('click',()=>{
              modernModal.style.display = "none";
              location.assign('/upravljajkonkursima')
            })
          
          
        
          }
          else{
            poruka.innerHTML=data.message
          }

          



        }




  })


})