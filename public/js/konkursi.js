let startTime;
let endTime;
document.getElementById('job-container').addEventListener('focusin', () => {
    if (!startTime) {
         startTime = new Date(); // Početno vrijeme
        console.log('Popunjavanje započeto:', startTime);
    }
});
document.addEventListener('DOMContentLoaded', async () => {

  const jwtToken = localStorage.getItem('jwt');
  

  const res1 = await fetch('/konkursi/jwtAuth', {
      method: 'GET',
      headers: {'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`}
  });

  if (!res1.ok) {
      localStorage.removeItem('jwt');
      location.assign('/');
  }

  const ime1 = localStorage.getItem('ime');
  

  const res = await fetch('/konkursi/podaci', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
  });
  const loadingIndicator = document.querySelector(".loading-container");
  loadingIndicator.style.display = "block";

  if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
  }

  const data1 = await res.json();
  console.log(data1);

  if (data1.success) {
    loadingIndicator.style.display = "none";
      const jobContainer = document.getElementById('job-container');
      if (jobContainer.textContent.trim() !== "") {
          jobContainer.textContent = ""; 
      }

      if (!jobContainer) {
          console.log('ne postoji');
      }

      // Kontejner gde će se dodati poslovi
      const jobs = data1.data; // Lista poslova

      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.classList.add('mt-4');

          // Iskustvo formatiranje
          job.iskustvo = job.iskustvo.replace(/{"junior"}/, 'Junior')
                                      .replace(/{"senior"}/, 'Senior')
                                      .replace(/{"medior"}/, 'Medior')
                                      .replace(/{"bez iskustva"}/, 'Bez iskustva');

          if (job.status === 'aktivan') {
            jobCard.innerHTML = `
            <div class="container mt-4">
              <div class="card mb-3" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <div class="row g-0">
                  <div class="col-md-3">
                    <img src="images/ITjobs.png" class="img-fluid" alt="Job Image" style="object-fit: cover; height: 100%; border-top-left-radius: 10px; border-bottom-left-radius: 10px;">
                  </div>
                  <div class="col-md-7">
                    <div class="card-body">
                      <h5 class="card-title" style="font-size: 1.2rem; font-weight: 600; color: #333;">
                        <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary">${job.id_konkursa}. ${job.naziv}</a>
                      </h5>
                      <p class="card-text" style="color: #666; font-size: 0.95rem;">
                        <small class="text-muted">${job.lokacija}</small> |
                        <small class="text-muted">${job.iskustvo}</small> |
                        <small class="text-muted">${job.tip}</small> |
                        <small class="text-success">${job.status} do ${new Date(job.rok_za_prijavu).toLocaleString()}</small>
                      </p>
                    </div>
                  </div>
                  <div class="col-md-2 d-flex flex-column justify-content-center align-items-center">
                    <button class="btn btn-primary mt-2 pregledaj">Pregledaj</button>
                    <button class="btn btn-primary mt-2 apliciraj">Apliciraj!</button>
                  </div>
                </div>
              </div>
            </div>`;
          

              // Dodaj generisani HTML u kontejner
              jobContainer.appendChild(jobCard);
          }
      });
  }
});

// Delegacija događaja za sve dugmadi "Pregledaj"
document.getElementById('job-container').addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('pregledaj')) {
      console.log('Pregledaj kliknut');

      const jobId = e.target.closest('.card').querySelector('.card-title a').dataset.id;
      console.log('ID konkursa:', jobId);

      // Ovdje šaljemo zahtev za detalje o konkursu na server
  
          const res = await fetch('/konkursi/detalji',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({jobId})
          });
          const data = await res.json();
          const loadingIndicator = document.querySelector(".loading-container");
          loadingIndicator.style.display = "block";

          if (data.success) {
            loadingIndicator.style.display = "none";
              const modal = document.getElementById('modal');
              const close = document.getElementById('close');
              
              // Popuni modal sa podacima
              document.getElementById('modal-title').innerHTML = data.data[0].naziv;
              document.getElementById('modal-description').innerHTML = data.data[0].opis;
              document.getElementById('modal-tip').innerHTML = data.data[0].tip;
              document.getElementById('modal-location').innerHTML = data.data[0].lokacija;
              data.data[0].iskustvo = data.data[0].iskustvo.replace(/{"junior"}/, 'Junior')
              .replace(/{"senior"}/, 'Senior')
              .replace(/{"medior"}/, 'Medior')
              .replace(/{"bez iskustva"}/, 'Bez iskustva');
              document.getElementById('modal-iskustvo').innerHTML = data.data[0].iskustvo;

              const datestring=data.data[0].datum_kreiranja;
              const date = new Date(datestring);
              const formattedDate = date.toLocaleDateString('hr-HR');

              document.getElementById('modal-date').innerHTML = formattedDate;

              // Pokaži modal
              modal.style.display = "block";

              // Zatvaranje modala
              close.addEventListener('click', () => {
                  modal.style.display = "none";
              });

              // Zatvaranje modala klikom na pozadinu
              window.addEventListener('click', (event) => {
                  if (event.target === modal) {
                      modal.style.display = "none";
                  }
              });
          } else {
              console.error('Greška u preuzimanju podataka');
          }
      } 
});

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
  }

const showSuccessModal = () => {
    const modal = document.getElementById('successModal');
  modal.classList.add('show');
  modal.style.display = 'block';
};

document.getElementById('filtriraj').addEventListener('click',async(e)=>{
  e.preventDefault()
  const select1=document.getElementById('filter').value;
  const select2=document.getElementById('filter1').value;
 
  console.log(select1,select2)


  const res=await fetch('/konkursi/filter',{
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({select1,select2})
  }) 
  const loadingIndicator = document.querySelector(".loading-container");
  loadingIndicator.style.display = "block";
  const data1 = await res.json();
  console.log(data1);

  if (data1.success) {
    loadingIndicator.style.display = "none";
      const jobContainer = document.getElementById('job-container');
      if (jobContainer.textContent.trim() !== "") {
          jobContainer.textContent = ""; 
      }

      if (!jobContainer) {
          console.log('ne postoji');
      }

      // Kontejner gde će se dodati poslovi
      const jobs = data1.data; // Lista poslova

      if(jobs.length==0){
        jobContainer.innerHTML='Nije pronađen ni jedan konkurs!'
        jobContainer.className='text-center mt-5 danger'

      }

      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.classList.add('mt-4');

          // Iskustvo formatiranje
          job.iskustvo = job.iskustvo.replace(/{"junior"}/, 'Junior')
                                      .replace(/{"senior"}/, 'Senior')
                                      .replace(/{"medior"}/, 'Medior')
                                      .replace(/{"bez iskustva"}/, 'Bez iskustva');

          if (job.status === 'aktivan') {
              jobCard.innerHTML = `
                  <div class="container mt-4">
                      <div class="card mb-3">
                          <div class="row g-0">
                              <div class="col-md-2">
                                  <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image">
                              </div>
                              <div class="col-md-8">
                                  <div class="card-body">
                                      <h5 class="card-title">
                                          <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary">${job.id_konkursa}. ${job.naziv}</a>
                                      </h5>
                                      <p class="card-text">
                                          <small class="text-muted">${job.lokacija}</small> |
                                          <small class="text-muted">${job.iskustvo}</small> |
                                          <small class="text-muted">${job.tip}</small> |
                                          <small class="text-success">${job.status} do ${new Date(job.rok_za_prijavu).toLocaleString()}</small>
                                      </p>
                                  </div>
                              </div>
                              <div class="col-md-2">
                                  <button class="btn btn-primary mt-2 pregledaj">Pregledaj</button>
                                  <button class="btn btn-primary mt-2 apliciraj">Apliciraj</button>
                              </div>
                          </div>
                      </div>
                  </div>`;

              // Dodaj generisani HTML u kontejner
              jobContainer.appendChild(jobCard);
          }
      });}
  
})


function openModal() {
  const modal = document.getElementById('applyModal');
  modal.classList.add('show'); // Dodajemo 'show' klasu
  modal.style.display = 'block'; // Setujemo display da bude 'block'
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  document.body.classList.add('modal-open'); // Dodajemo 'modal-open' na body za pozadinsku senku
}
function closeModal() {
  const modal = document.getElementById('applyModal');
  modal.classList.add('show'); // Dodajemo 'show' klasu
  modal.style.display = 'none'; // Setujemo display da bude 'block'
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  document.body.classList.add('modal-open'); // Dodajemo 'modal-open' na body za pozadinsku senku
}

document.getElementById('job-container').addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('apliciraj')) {
      console.log('aplciiraj kliknut');
  e.preventDefault()

  

  const jobId = e.target.closest('.card').querySelector('.card-title a').dataset.id;
  console.log('ID konkursa:', jobId);
  const res = await fetch('/konkursi/detalji',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({jobId})
  });
  
  const data = await res.json();


  if (data.success){

   /* const nazuvkonkursa=document.getElementById('nazivKonkursa')
    nazuvkonkursa.innerHTML=data.data[0].naziv;*/

    const dynamicContainer = document.getElementById("dynamicInputsContainer");
    dynamicContainer.innerHTML = "";

    const requiredFields= data.data[0].obavezna_polja

    function createInput(labelText, inputId, type = "text") {
      const inputDiv = document.createElement("div");
      inputDiv.className = "form-group mb-3";
  
      // Labela
      const label = document.createElement("label");
      label.htmlFor = inputId;
      label.textContent = labelText;
      inputDiv.appendChild(label);
  
      // Input polje
      const input = document.createElement("input");
      input.type = type;
      input.id = inputId;
      input.name = inputId;
      input.className = "form-control";
      input.required = true;
      inputDiv.appendChild(input);
  
      return inputDiv;
  }
  
  // Dinamički kreiraj sva polja na osnovu liste
  const container = document.getElementById("dynamicInputsContainer");
  requiredFields.forEach((field) => {
      let labelText;
      let type = "text";
  
      // Prevod labela i specijalni slučajevi
      switch (field) {
          case "ime":
              labelText = "Ime";
              break;
          case "prezime":
              labelText = "Prezime";
              break;
          case "email":
              labelText = "Email";
              type = "email";
              break;
          case "adresa":
              labelText = "Adresa";
              break;
          case "grad":
              labelText = "Grad";
              break;
          case "drzava":
              labelText = "Država";
              break;
          case "cv":
              labelText = "CV";
              type = "file";
              break;
          case "motivaciono":
              labelText = "Motivaciono Pismo";
              type = "textarea";
              break;
          default:
              labelText = field;
      }
  
      // Kreiranje inputa
      const input = field === "motivaciono" 
          ? document.createElement("textarea") 
          : createInput(labelText, field, type);
      
      if (field === "motivaciono") {
          input.id = field;
          input.name = field;
          input.className = "form-control";
          input.rows = 4;
          input.placeholder = "Unesite motivaciono pismo...";
        
      }
  
      container.appendChild(input);
  });
  openModal();
  }
  // Dodaj event listener na dugme X (btn-close)
  document.querySelector('.btn-close').addEventListener('click', () => {
      closeModal()
  });

  document.getElementById('aplicirajnakonkurs').addEventListener('click', async (e) => {
    console.log('kliknuto');
    e.preventDefault();
    endTime = new Date(); // Krajnje vreme
    

    // Izračunavanje razlike u milisekundama
   
     
    const timeTaken = endTime - startTime;
    const seconds = Math.floor(timeTaken / 1000); // Pretvaranje u sekunde
    console.log('Popunjavanje završeno:',seconds);
    // Funkcija za dobijanje vrednosti ili null ako je prazno
    const getValueOrNull = (id) => {
        const element = document.getElementById(id);
        if (!element) return null; // Ako element nije pronađen, vrati null
    
        if (element.type === 'file') {
            return element.files[0] || null; // Za fajl polja vrati fajl ili null
        }
    
        return element.value ? element.value.trim() : null; // Proveri da li `value` postoji pre `trim()`
    };

    // Prikupljanje vrednosti iz input polja
    const id_korisnika=localStorage.getItem('id')
    const id_konkursa = jobId
    const ime = getValueOrNull('ime');
    const prezime = getValueOrNull('prezime');
    const email = getValueOrNull('email');
    const grad = getValueOrNull('grad');
    const adresa = getValueOrNull('adresa');
    const drzava = getValueOrNull('drzava');
    const cv = getValueOrNull('cv'); // Ovo je sada fajl objekat
    const motivaciono = getValueOrNull('motivaciono');

    // Formiranje FormData objekta
    const formData = new FormData();
    formData.append('id_korisnika',id_korisnika);
    formData.append('id_konkursa',id_konkursa);
    formData.append('ime', ime || '');
    formData.append('prezime', prezime || '');
    formData.append('email', email || '');
    formData.append('grad', grad || '');
    formData.append('adresa', adresa || '');
    formData.append('drzava', drzava || '');
    formData.append('cv', cv || ''); // Dodaj fajl
    formData.append('motivaciono', motivaciono || '');
    formData.append('vrijeme',seconds)

    
        const res = await fetch('/konkursi/apliciraj', {
            method: 'POST',
            body: formData,
        });
        
        const data=await res.json()

        if (data.success){
            closeModal()
            showSuccessModal()


        }
     
});

  }
})


