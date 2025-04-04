document.addEventListener('DOMContentLoaded', async () => {

    const jwtToken = localStorage.getItem('jwt');
    
  
    const res1 = await fetch('/mojeaplikacije/jwtAuth', {
        method: 'GET',
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`}
    });
  
    if (!res1.ok) {
        localStorage.removeItem('jwt');
        location.assign('/');
    }

    const id=localStorage.getItem('id')
    const mjestoZaAplikacije=document.getElementById('Aplikacije-list')

    const res=await fetch('/mojeaplikacije/prikazaplikacija',{

        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({id})

    })

    const data=await res.json()

    if(data.success){
      const loadingIndicator = document.querySelector(".loading-container");
      loadingIndicator.style.display = "none";
        const aplikacije=data.data
        console.log(aplikacije)

        aplikacije.forEach(aplikacija => {
                let datum = new Date(aplikacija.datum_aplikacije);
              const div = document.createElement('div');
              div.className = 'card mb-3 shadow-sm'; // Stilizacija kartice
          if (aplikacija.status_aplikacije=='Prijavljen'){
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                    <button onclick="otkaziaplikaciju(${aplikacija.id_aplikacije})" class="btn btn-danger btn-sm otkazi">Otkaži Aplikaciju</button>
                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)

          }

        else if (aplikacija.status_aplikacije=='Pozvan na intervju'){
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                    <button onclick="Potvrdidolazak(${aplikacija.id_aplikacije})" class="btn btn-danger btn-sm otkazi">Potvrdi dolazak na intervju</button>
                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)

          }
          else{
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)


          }
              
            
       
    })




}

})



function showModal1() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Zamrzni ekran
}

// Zatvori modal
function closeModal1() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Omogući skrolovanje
}

async function otkaziaplikaciju(id) {

    const res= await fetch('/mojeaplikacije/otkaziaplikaciju',{
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id})

    })

    const data=await res.json()

    if(data.success){
      const loadingIndicator = document.querySelector(".loading-container");
      loadingIndicator.style.display = "none";
        showModal1()

    }
    
}

async function filtriraj(event) {
  
    event.preventDefault()
    const mjestoZaAplikacije=document.getElementById('Aplikacije-list')



    const id=localStorage.getItem('id')
    let status=document.getElementById('filter1').value
    console.log(id,status)

    const res= await fetch('/mojeaplikacije/filtriraj',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id,status})
    })
    
    const data=await res.json()

    if(data.success){
     
        mjestoZaAplikacije.textContent=""
        const aplikacije=data.data
        console.log(aplikacije)


        if (aplikacije.length==0){
            mjestoZaAplikacije.textContent='Nije pronađen ni jedan konkurs! '
        }


        aplikacije.forEach(aplikacija => {
                let datum = new Date(aplikacija.datum_aplikacije);
              const div = document.createElement('div');
              div.className = 'card mb-3 shadow-sm'; // Stilizacija kartice
          if (aplikacija.status_aplikacije=='Prijavljen'){
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                    <button onclick="otkaziaplikaciju(${aplikacija.id_aplikacije})" class="btn btn-danger btn-sm otkazi">Otkaži Aplikaciju</button>
                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)

          }

          else if (aplikacija.status_aplikacije=='Pozvan na intervju'){
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                    <button onclick="Potvrdidolazak(${aplikacija.id_aplikacije}, '${aplikacija.email}')" class="btn btn-danger btn-sm otkazi">Potvrdi dolazak na intervju</button>

                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)

          }
          else{
            div.innerHTML = `
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${aplikacija.naziv}</h5>
                  <p class="card-text">
                    <strong>Status:</strong> <span class="text-success">${aplikacija.status_aplikacije}</span><br>
                    <strong>Datum prijave:</strong> ${datum.toLocaleDateString() || 'Nije dostupno'}
                  </p>
                  <div class="d-flex justify-content-end">
                    <button onclick="prikazidetalje(${aplikacija.id_aplikacije})" class="btn btn-outline-primary btn-sm me-2 detalji">Detalji</button>
                  </div>
                </div>
              `;

              mjestoZaAplikacije.appendChild(div)


          }
              
            
      
    })



    }
}
function showModal() {

    const modal = document.getElementById('customModal');
    modal.style.display = 'block';
  }
  
  function closeModal() {
    // Sakrijte modal
    const modal = document.getElementById('customModal');
    modal.style.display = 'none';
  }
async function prikazidetalje(id) {

    const modal = document.getElementById('customModal');
    const modalClose = document.querySelector('.custom-modal-close');
    const res=await fetch('/mojeaplikacije/prikazidetalje',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id})
    })
    
    const data=await res.json()

    console.log(data)

    if(data.success){
    

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const podaci=data.data[0]
        let datum = new Date(podaci.datum_aplikacije);
        
    
        // Dinamički postavi sadržaj
        modalTitle.textContent = 'Detalji aplikacije';
        modalBody.innerHTML = `
          <p><strong>Ime:</strong> ${podaci.ime} ${podaci.prezime}</p>
          <p><strong>Email:</strong> ${podaci.email}</p>
          <p><strong>Adresa:</strong> ${podaci.adresa || 'Nepoznato'}</p>
          <p><strong>Grad:</strong> ${podaci.grad || 'Nepoznato'}</p>
           <p><strong>Država:</strong> ${podaci.Država || 'Nepoznato'}</p>
            <p><strong>Motivaciono pismo:</strong> ${podaci.motivaciono || 'Nepoznato'}</p>
             <p><strong>Datum aplikacije:</strong> ${datum.toLocaleString()|| 'Nepoznato'}</p>
        `;


        showModal()
      }
    
      // Funkcija za zatvaranje modala

      function closeModal() {
        modal.style.display = 'none';
      }
  // Dodaj event listener za zatvaranje
  modalClose.addEventListener('click', closeModal);

    
}


async function Potvrdidolazak(id,email) {
  console.log(email)
 
  const res= await fetch('/mojeaplikacije/potvrdidolazak',{
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id,email})

  })

  const data=await res.json()

  if(data.success){
    console.log('uspjelo')
      showModal1()
  }


 
  
}