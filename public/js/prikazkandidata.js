const starRatingContainer = document.getElementById('star-rating');
const ratingValue = document.getElementById('rating-value');
let selectedOcjena = null; // Globalna promenljiva za čuvanje selektovane ocene

// Kreiraj zvezdice dinamički
for (let i = 1; i <= 5; i++) {
  const star = document.createElement('span');
  star.className = 'star';
  star.dataset.value = i;
  star.innerHTML = '★';

 
  if (i <= parseInt(ratingValue.textContent)) {
    star.classList.add('filled');
  }

  starRatingContainer.appendChild(star);
}

// Dodaj funkcionalnost za izbor ocene
starRatingContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('star')) {
    selectedOcjena = event.target.dataset.value; // Postavi selektovanu ocenu
    console.log(`Izabrana ocjena: ${selectedOcjena}`); // Debug log

    // Popuni sve prethodne zvezdice
    document.querySelectorAll('.star').forEach(star => {
      star.classList.toggle('filled', star.dataset.value <= selectedOcjena);
    });

    // Prikaz nove ocene
    ratingValue.textContent = selectedOcjena;
  }
});

document.addEventListener('DOMContentLoaded', async () =>{

  
           
    const jwtToken = localStorage.getItem('jwt')
    console.log(jwtToken)
    const res1 = await fetch('/upravljajkonkursima/jwtAuth', {
        method: 'GET',
        headers: {'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`}
    })
    if (!res1.ok) {
      localStorage.removeItem('jwt');
      location.assign('/')
  }
})
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById('komentarModal');
    modal.classList.remove('show'); // Uklanja klasu za prikaz
    modal.style.display = 'none'; // Sakriva modal
    modal.setAttribute('aria-hidden', 'true'); // Ažurira atribut pristupačnosti
    document.body.classList.remove('modal-open'); // Omogućava skrolovanje
  });
});

async function unesikomentar(id_korisnika,id_konkursa,ev){
  

  console.log('keosj')

  ev.preventDefault();

  const komentar=document.getElementById('komentar').value;

  const res=await fetch('/prikazkandidata/komentar',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({komentar,id_korisnika,id_konkursa})

  })

  const data=await res.json();


  if (data.success){

    const modal = document.getElementById('komentarModal');
  modal.classList.add('show'); // Dodaje klasu za prikaz modala
  modal.style.display = 'block'; // Prikazuje modal
  modal.setAttribute('aria-hidden', 'false'); // Ažurira atribut pristupačnosti
  document.body.classList.add('modal-open'); // Sprečava skrolovanje pozadine

  }

 
}

async function unesiocjenu(id_korisnika, id_konkursa, ev) {
  ev.preventDefault();

  if (!selectedOcjena) {
    console.error("Nije izabrana ocjena za slanje!");
    return;
  }

  try {
    const res = await fetch('/prikazkandidata/ocjena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ocjena: selectedOcjena, id_korisnika, id_konkursa })
    });

    const data = await res.json();

    if (data.success) {
      console.log("Ocjena uspješno sačuvana!");
      const modalTrigger = document.querySelector('[data-bs-toggle="modal1"]');
      if (modalTrigger) {
        modalTrigger.click();
      }
    } else {
      console.error("Greška pri čuvanju ocjene:", data.message);
    }
  } catch (err) {
    console.error("Greška prilikom slanja zahteva:", err);
  }
}


async function posaljiemail(event, email,id) {
  event.preventDefault()

  const datumVrijeme = document.getElementById('datumVrijeme').value;


  try {
    const response = await fetch('/prikazkandidata/pozoviNaIntervju', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datumVrijeme, email ,id}),
    });

    const result = await response.json();

    if (result.success) {
      alert('Email uspješno poslan!');
    } else {
      console.log('ne radi')
    }
    zatvoriModal();
  } catch (error) {
    console.error('Greška:', error);
    
  }
}

async function promijenistatus(ev,status,email,id){
  console.log(status, email, id)
  const res= await fetch('/prikazkandidata/promjenastatusa',{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({status,email,id})
  })
}

async function posaljiemail2(event, email) {
  event.preventDefault()

  const datumVrijeme = document.getElementById('datumVrijeme').value;


  try {
    const response = await fetch('/prikazkandidata/odbij', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (result.success) {
      alert('Email uspješno poslan!');
    } else {
        console.log(88)
    }
    zatvoriModal();
  } catch (error) {
    console.error('Greška:', error);
    console.log(5)
  }
}

async function GenerisiPdf(event, id) {
  event.preventDefault(); // Sprečava podrazumevani submit ili reload
  console.log('fff')
  
  try {
    // Fetch podaci o kandidatu sa servera
    const res = await fetch('/prikazkandidata/PodaciZaPdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    console.log(data.cvPath)

    if (data.success) {
      const kandidat = data.data[0];
      
      // Kreiraj PDF koristeći jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      // Dodavanje sadržaja u PDF
      pdf.setFontSize(18);
      pdf.text(`Informacije o kandidatu ${kandidat.ime} ${kandidat.prezime}`, 30, 20);

      pdf.setFontSize(12);
      pdf.addImage('images/hr.png','PNG', 10,10,10,10)
      pdf.text(`Ime: ${kandidat.ime} ${kandidat.prezime}`, 20, 40);
      pdf.text(`Email: ${kandidat.email}`, 20, 50);
      pdf.text(`Adresa: ${kandidat.adresa || 'Nepoznato'}`, 20, 60);
      pdf.text(`Grad: ${kandidat.grad || 'Nepoznato'}`, 20, 70);
      pdf.text(`Država: ${kandidat.drzava || 'Nepoznato'}`, 20, 80);
      pdf.text(`Motivaciono pismo: ${kandidat.motivaciono || 'Nepoznato'}`, 20, 90);
      pdf.text(`Datum aplikacije: ${new Date(kandidat.datum_aplikacije).toLocaleString() || 'Nepoznato'}`, 20, 100);
      if (data.cvPath) {
        pdf.textWithLink('Preuzmite CV kandidata na klik', 20, 110, { url: data.cvPath });
      } else {
        pdf.text('CV kandidata nije dostupan.', 20, 110);
      }




      // Generiši i preuzmi PDF
      pdf.save(`Informacije_o_kandidatu_${kandidat.ime}_${kandidat.prezime}.pdf`);
    } else {
      console.error('Neuspešno dobijanje podataka o kandidatu.');
    }
  } catch (error) {
    console.error('Greška prilikom generisanja PDF-a:', error);
  }
}
