

document.addEventListener('DOMContentLoaded', async () =>{

  
           
    const jwtToken = localStorage.getItem('jwt')
    console.log(jwtToken)
    const res1 = await fetch('http://localhost:3000/upravljajkonkursima/jwtAuth', {
        method: 'GET',
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`}
    })
    if (!res1.ok) {
      localStorage.removeItem('jwt');
      location.assign('/')
  }


    const res=await fetch('http://localhost:3000/upravljajkonkursima/uzimanjepodataka',{
      method:'GET',
      headers: {'Content-Type': 'application/json'}
    })

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
  }


    const data1=await res.json();

    if(data1.success){
      const loadingIndicator = document.querySelector(".loading-container");
      loadingIndicator.style.display = "none";
      const jobContainer = document.getElementById('job-container');
      if (jobContainer.textContent.trim() !== "") {
        jobContainer.textContent = ""; 
      }
      if(!jobContainer){
        console.log('ne postoji')
      }
      // Kontejner gde će se dodati poslovi
      const jobs = data1.data; // Lista poslova

      // Iteriraj kroz sve poslove i generiši HTML
      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.classList.add('mt-4');
          if(job.iskustvo=='{"junior"}'){
            job.iskustvo='Junior'
          }
          if(job.iskustvo=='{"senior"}'){
            job.iskustvo='Senior'
          }
          if(job.iskustvo=='{"medior"}'){
            job.iskustvo='Medior'
          }
          if(job.iskustvo=='{"bez iskustva"}'){
            job.iskustvo='Bez iskustva'
          }

          if(job.status=='aktivan'){

            const isoDate=job.rok_za_prijavu
            const datum=new Date(isoDate)
            const formattedDate = `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;

            jobCard.innerHTML = `
    <div class="container mt-4">
        <div class="card shadow-sm border-light mb-3">
            <div class="row g-0">
                <!-- Job Image -->
                <div class="col-md-3">
                    <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                </div>
                <!-- Job Details -->
                <div class="col-md-7">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                        </h5>
                        <p class="card-text">
                            <small class="text-muted">${job.lokacija}</small> |
                            <small class="text-muted">${job.iskustvo}</small> |
                            <small class="text-muted"> ${job.tip}</small> |
                            <small class="text-success">${job.status}</small>|
                             <small class="text-success">${formattedDate}</small>
                        </p>
                    </div>
                </div>
                <!-- Archive Button -->
                <div class="col-md-2 d-flex align-items-center justify-content-center">
                    <button onclick="arhiviraj(event,'${job.id_konkursa}','arhivirano')" class="btn btn-warning btn-sm px-4 py-2 me-2">Arhiviraj</button>
                    <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                </div>
            </div>
        </div>
    </div>`;


        }
        else{
          jobCard.innerHTML = `
    <div class="container mt-4">
        <div class="card shadow-sm border-light mb-3">
            <div class="row g-0">
                <!-- Job Image -->
                <div class="col-md-3">
                    <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                </div>
                <!-- Job Details -->
                <div class="col-md-7">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                        </h5>
                        <p class="card-text">
                            <small class="text-muted">${job.lokacija}</small> |
                            <small class="text-muted">${job.iskustvo}</small> |
                            <small class="text-muted"> ${job.tip}</small> |
                            <small class="text-success">${job.status}</small>
                        </p>
                    </div>
                </div>
                <!-- Archive Button -->
                <div class="col-md-2 d-flex align-items-center justify-content-center">
                    <button onclick="arhiviraj(event,'${job.id_konkursa}','aktivan')" class="btn btn-warning btn-sm px-4 py-2 me-2">Aktiviraj</button>
                     <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                </div>
            </div>
        </div>
    </div>`;

        
        }

          // Dodaj generisani HTML u kontejner
          jobContainer.appendChild(jobCard);
      });



    }
    
  })


  document.getElementById('filtriraj').addEventListener('click', async (e) =>{
    e.preventDefault()
    const tip2=document.getElementById('filter').value

    if (tip2!='svi'){
      console.log(tip2);
    const res4=await fetch('http://localhost:3000/upravljajkonkursima/filtriraj',{
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({tip2})
    })

    if (!res4.ok) {
      throw new Error(`HTTP error! Status: ${res4.status}`);
  }


    const data3=await res4.json();

    if(data3.success==true){
      console.log(data3);
      const jobContainer2 = document.getElementById('job-container');
      jobContainer2.innerHTML='';
      
      // Kontejner gde će se dodati poslovi
      const jobs = data3.data; // Lista poslova

      // Iteriraj kroz sve poslove i generiši HTML
      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.classList.add('mt-4');
          if(job.iskustvo=='{"junior"}'){
            job.iskustvo='Junior'
          }
          if(job.iskustvo=='{"senior"}'){
            job.iskustvo='Senior'
          }
          if(job.iskustvo=='{"medior"}'){
            job.iskustvo='Medior'
          }
          if(job.iskustvo=='{"bez iskustva"}'){
            job.iskustvo='Bez iskustva'
          }

          if(job.status=='aktivan'){

            const isoDate=job.rok_za_prijavu
            const datum=new Date(isoDate)
            const formattedDate = `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;

            jobCard.innerHTML = `
    <div class="container mt-4">
        <div class="card shadow-sm border-light mb-3">
            <div class="row g-0">
                <!-- Job Image -->
                <div class="col-md-3">
                    <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                </div>
                <!-- Job Details -->
                <div class="col-md-7">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                        </h5>
                        <p class="card-text">
                            <small class="text-muted">${job.lokacija}</small> |
                            <small class="text-muted">${job.iskustvo}</small> |
                            <small class="text-muted"> ${job.tip}</small> |
                            <small class="text-success">${job.status}</small>|
                             <small class="text-success">${formattedDate}</small>
                        </p>
                    </div>
                </div>
                <!-- Archive Button -->
                <div class="col-md-2 d-flex align-items-center justify-content-center">
                    <button onclick="arhiviraj(event,'${job.id_konkursa}','arhivirano')" class="btn btn-warning btn-sm px-4 py-2 me-2">Arhiviraj</button>
                      <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                </div>
            </div>
        </div>
    </div>`;


        }
        else{
          jobCard.innerHTML = `
    <div class="container mt-4">
        <div class="card shadow-sm border-light mb-3">
            <div class="row g-0">
                <!-- Job Image -->
                <div class="col-md-3">
                    <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                </div>
                <!-- Job Details -->
                <div class="col-md-7">
                    <div class="card-body">
                        <h5 class="card-title mb-3">
                            <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                        </h5>
                        <p class="card-text">
                            <small class="text-muted">${job.lokacija}</small> |
                            <small class="text-muted">${job.iskustvo}</small> |
                            <small class="text-muted"> ${job.tip}</small> |
                            <small class="text-success">${job.status}</small>
                        </p>
                    </div>
                </div>
                <!-- Archive Button -->
                <div class="col-md-2 d-flex align-items-center justify-content-center">
                    <button onclick="arhiviraj(event,'${job.id_konkursa}','aktivan')" class="btn btn-warning btn-sm px-4 py-2 me-2">Aktiviraj</button>
                     <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                </div>
            </div>
        </div>
    </div>`;

        
        }


          // Dodaj generisani HTML u kontejner
          jobContainer2.appendChild(jobCard);
      });



    }
    }
    else{
      const res=await fetch('http://localhost:3000/upravljajkonkursima/uzimanjepodataka',{
        method:'GET',
        headers: {'Content-Type': 'application/json'}
      })
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
    }
  
  
      const data1=await res.json();
  
      if(data1.success==true){
        const jobContainer = document.getElementById('job-container');
        if (jobContainer.textContent.trim() !== "") {
          jobContainer.textContent = ""; 
        }
        if(!jobContainer){
          console.log('ne postoji')
        }
        // Kontejner gde će se dodati poslovi
        const jobs = data1.data; // Lista poslova
  
        // Iteriraj kroz sve poslove i generiši HTML
        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('mt-4');
            if(job.iskustvo=='{"junior"}'){
              job.iskustvo='Junior'
            }
            if(job.iskustvo=='{"senior"}'){
              job.iskustvo='Senior'
            }
            if(job.iskustvo=='{"medior"}'){
              job.iskustvo='Medior'
            }
            if(job.iskustvo=='{"bez iskustva"}'){
              job.iskustvo='Bez iskustva'
            }
  
            if(job.status=='aktivan'){

              const isoDate=job.rok_za_prijavu
              const datum=new Date(isoDate)
              const formattedDate = `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;
  
              jobCard.innerHTML = `
      <div class="container mt-4">
          <div class="card shadow-sm border-light mb-3">
              <div class="row g-0">
                  <!-- Job Image -->
                  <div class="col-md-3">
                      <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                  </div>
                  <!-- Job Details -->
                  <div class="col-md-7">
                      <div class="card-body">
                          <h5 class="card-title mb-3">
                              <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                          </h5>
                          <p class="card-text">
                              <small class="text-muted">${job.lokacija}</small> |
                              <small class="text-muted">${job.iskustvo}</small> |
                              <small class="text-muted"> ${job.tip}</small> |
                              <small class="text-success">${job.status}</small>|
                               <small class="text-success">${formattedDate}</small>
                          </p>
                      </div>
                  </div>
                  <!-- Archive Button -->
                  <div class="col-md-2 d-flex align-items-center justify-content-center">
                      <button onclick="arhiviraj(event,'${job.id_konkursa}','arhivirano')" class="btn btn-warning btn-sm px-4 py-2 me-2">Arhiviraj</button>
                      <button onclick="arhiviraj(event,'${job.id_konkursa}','arhivirano')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                  </div>
              </div>
          </div>
      </div>`;
  
  
          }
          else{
            jobCard.innerHTML = `
      <div class="container mt-4">
          <div class="card shadow-sm border-light mb-3">
              <div class="row g-0">
                  <!-- Job Image -->
                  <div class="col-md-3">
                      <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                  </div>
                  <!-- Job Details -->
                  <div class="col-md-7">
                      <div class="card-body">
                          <h5 class="card-title mb-3">
                              <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                          </h5>
                          <p class="card-text">
                              <small class="text-muted">${job.lokacija}</small> |
                              <small class="text-muted">${job.iskustvo}</small> |
                              <small class="text-muted"> ${job.tip}</small> |
                              <small class="text-success">${job.status}</small>
                          </p>
                      </div>
                  </div>
                  <!-- Archive Button -->
                  <div class="col-md-2 d-flex align-items-center justify-content-center">
                      <button onclick="arhiviraj(event,'${job.id_konkursa}','aktivan')" class="btn btn-warning btn-sm px-4 py-2 me-2">Aktiviraj</button>
                       <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                  </div>
              </div>
          </div>
      </div>`;
  
          
          }
  
  
      
            jobContainer.appendChild(jobCard);
        });
  
  
  
      }


    }
    

  
    

    
  })
  document.getElementById('pretrazi').addEventListener('click', async (ev) =>{
    ev.preventDefault()
    const NazivKonkursa=document.getElementById('pretrazivac').value
    const porukapretrazivac=document.getElementById('porukapretrazivac')

    console.log('Naziv konkursa:'+NazivKonkursa)

    if(!NazivKonkursa){
      porukapretrazivac.innerHTML='Unesite naziv konkursa!'

    }
    
    const res= await fetch('http://localhost:3000/upravljajkonkursima/pretrazi',{
          method:'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({NazivKonkursa})

    })

   const data=await res.json();


    if (data.success){
      const jobContainer = document.getElementById('job-container');
      if (jobContainer.textContent.trim() !== "") {
        jobContainer.textContent = ""; 
      }
        // Kontejner gde će se dodati poslovi
        const jobs = data.data; // Lista poslova
        console.log(jobs)

      
        // Iteriraj kroz sve poslove i generiši HTML
        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('mt-4');
            if(job.iskustvo=='{"junior"}'){
              job.iskustvo='Junior'
            }
            if(job.iskustvo=='{"senior"}'){
              job.iskustvo='Senior'
            }
            if(job.iskustvo=='{"medior"}'){
              job.iskustvo='Medior'
            }
            if(job.iskustvo=='{"bez iskustva"}'){
              job.iskustvo='Bez iskustva'
            }
            if(job.status=='aktivan'){

              const isoDate=job.rok_za_prijavu
              const datum=new Date(isoDate)
              const formattedDate = `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;
  
              jobCard.innerHTML = `
      <div class="container mt-4">
          <div class="card shadow-sm border-light mb-3">
              <div class="row g-0">
                  <!-- Job Image -->
                  <div class="col-md-3">
                      <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                  </div>
                  <!-- Job Details -->
                  <div class="col-md-7">
                      <div class="card-body">
                          <h5 class="card-title mb-3">
                              <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                          </h5>
                          <p class="card-text">
                              <small class="text-muted">${job.lokacija}</small> |
                              <small class="text-muted">${job.iskustvo}</small> |
                              <small class="text-muted"> ${job.tip}</small> |
                              <small class="text-success">${job.status}</small>|
                               <small class="text-success">${formattedDate}</small>
                          </p>
                      </div>
                  </div>
                  <!-- Archive Button -->
                  <div class="col-md-2 d-flex align-items-center justify-content-center">
                      <button onclick="arhiviraj(event,'${job.id_konkursa}','arhivirano')" class="btn btn-warning btn-sm px-4 py-2 me-2">Arhiviraj</button>
                    <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                  </div>
              </div>
          </div>
      </div>`;
  
  
          }
          else{
            jobCard.innerHTML = `
      <div class="container mt-4">
          <div class="card shadow-sm border-light mb-3">
              <div class="row g-0">
                  <!-- Job Image -->
                  <div class="col-md-3">
                      <img src="images/ITjobs.png" class="img-fluid rounded-start" alt="Job Image" style="object-fit: cover; height: 120px; width: 100%; border-radius: 8px;">
                  </div>
                  <!-- Job Details -->
                  <div class="col-md-7">
                      <div class="card-body">
                          <h5 class="card-title mb-3">
                              <a data-id="${job.id_konkursa}" class="text-decoration-none text-primary fw-bold">${job.id_konkursa}. ${job.naziv}</a>
                          </h5>
                          <p class="card-text">
                              <small class="text-muted">${job.lokacija}</small> |
                              <small class="text-muted">${job.iskustvo}</small> |
                              <small class="text-muted"> ${job.tip}</small> |
                              <small class="text-success">${job.status}</small>
                          </p>
                      </div>
                  </div>
                  <!-- Archive Button -->
                  <div class="col-md-2 d-flex align-items-center justify-content-center">
                      <button onclick="arhiviraj(event,'${job.id_konkursa}','aktivan')" class="btn btn-warning btn-sm px-4 py-2 me-2">Aktiviraj</button>
                      <button onclick="kreirajPDF(event,'${job.id_konkursa}')" class="btn btn-warning btn-sm px-4 py-2">Kreiraj PDF</button>
                  </div>
              </div>
          </div>
      </div>`;
  
          
          }
  


// Funkcija za zatvaranje modala
function closeModal() {
  modernModal.style.display = "none";
}
function showModal() {
  modernModal.style.display = "flex"; // Prikaz modal-a
}

closeModalButton.addEventListener("click", closeModal);
confirmButton.addEventListener("click", closeModal);
            
  
         
            jobContainer.appendChild(jobCard);
        });

    }
  })
  const modernModal = document.getElementById("modernModal");
  const closeModalButton = document.querySelector(".modern-modal-close");
  const confirmButton = document.querySelector(".modern-modal-button");
  const jobContainer = document.getElementById('job-container');


 
  
          
async function arhiviraj(event,id,status) {


    if(status=='aktivan'){
            
            const modal = document.getElementById('dateModal');
            modal.style.display = 'flex';

            document.getElementById('saveDate').addEventListener('click',async()=>{
              const noviDatum=document.getElementById('noviDatum').value
              console.log(noviDatum)
              const res= await fetch('http://localhost:3000/upravljajkonkursima/aktiviraj',{
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status,id,noviDatum})
    
              })
    
              const data=await res.json()
    
              if(data.success){
                modernModal.style.display = "flex";
                document.getElementById('zatvori').addEventListener('click',()=>{
                  modernModal.style.display = "none";
                  location.reload()
                })
            
              }
              else{
                console.log('ne radi')
              }

            })
              
      

            
            
  }





else{
  
  const res= await fetch('http://localhost:3000/upravljajkonkursima/arhiviraj',{
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status,id})

})

const data=await res.json()

if(data.success){
modernModal.style.display = "flex";
document.getElementById('zatvori').addEventListener('click',()=>{
  modernModal.style.display = "none";
  location.reload()
})

}
else{
console.log('ne radi')
}



}

  

      
    }


  
async function kreirajPDF(event,id) {
    event.preventDefault()

    const res=await fetch('http://localhost:3000/upravljajkonkursima/kreirajPDF',{
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({id})


    })

    const data= await res.json()

    if (data.success) {
      const konkurs = data.data[0];
      
      // Kreiraj PDF koristeći jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      const naziv= konkurs.naziv;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const textWidth = pdf.getTextWidth(naziv);
      const z = (pageWidth - textWidth) / 2;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(naziv, z, 20)

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.addImage('images/hr.png','PNG', 10,10,10,10)
  
      pdf.text(`Lokacija: ${konkurs.lokacija || 'Nepoznato'}`,2, 30);
      pdf.line(0, 35, 210, 35); // (x1, y1, x2, y2) 
      pdf.text(`Tip: ${konkurs.tip || 'Nepoznato'}`,2, 40);
      pdf.line(0, 45, 210, 45); // (x1, y1, x2, y2)
      pdf.text(`datum kreiranja: ${new Date(konkurs.datum_kreiranja).toLocaleString() || 'Nepoznato'}`,2, 50);
      pdf.line(0, 55, 210, 55); // (x1, y1, x2, y2)
      pdf.text(`status: ${konkurs.status || 'Nepoznato'}`,2, 60);
      pdf.line(0, 65, 210, 65); // (x1, y1, x2, y2)
      pdf.text(`Traženo iskustvo: ${konkurs.iskustvo || 'Nepoznato'}`,2, 70);
      pdf.line(0, 75, 210, 75); // (x1, y1, x2, y2)
      pdf.text(`Rok za prijavu: ${new Date(konkurs.rok_za_prijavu).toLocaleString() || 'Nepoznato'}`,2, 80);
      pdf.line(0, 85, 210, 85); // (x1, y1, x2, y2)
      const opis = `Opis: ${konkurs.opis}`;
      const maxWidth = 180;
      const wrappedText = pdf.splitTextToSize(opis, maxWidth);
      pdf.text(wrappedText,2, 90);





      // Generiši i preuzmi PDF
      pdf.save(`Informacije_o_konkursu_${konkurs.naziv}.pdf`);
    } else {
      console.error('Neuspiješno dobijanje podataka o konkursu.');
    }
  } 