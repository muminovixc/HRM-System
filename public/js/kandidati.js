document.addEventListener("DOMContentLoaded", async (ev) => {
  // PreventDefault nije potreban ovde, jer 'DOMContentLoaded' ne zahteva preventDefault
  const jwtToken = localStorage.getItem("jwt");
  console.log(jwtToken);
  const res1 = await fetch("http://localhost:3000/kandidati/jwtAuth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!res1.ok) {
    localStorage.removeItem("jwt");
    location.assign("/");
  }

  const res = await fetch("http://localhost:3000/kandidati/options", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  const konkursSelect = document.getElementById("konkurs"); // Premeštena inicijalizacija

  if (data.success) {
    const loadingIndicator = document.querySelector(".loading-container");
    loadingIndicator.style.display = "none";
    data.data.forEach((konkurs) => {
      const option = document.createElement("option");
      option.value = konkurs.id_konkursa;
      option.textContent = konkurs.naziv; // Prikazujemo naziv konkurs
      konkursSelect.appendChild(option);
    });
  }
});

document.getElementById("prikaz").addEventListener("click", async (e) => {
  e.preventDefault();
  const konkursSelect = document.getElementById("konkurs");
  const id = konkursSelect.value;
  const poruka = document.getElementById("porukica");
  var brojacnepregledanih = 0;
  var brojactpozvanih = 0;
  var brojacodbijenih = 0;

  const res = await fetch("http://localhost:3000/kandidati/prikaz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  var data = await res.json();
  var id_korisnika = data.data.id_korisnika;

  console.log("Odgovor sa servera:", data);

  var kandidatiContainer = document.getElementById("kandidati");

  console.log("Podaci unutar data.data:", data.data);

  if (data.success) {
    console.log(data.data.id_konkursa);
    kandidatiContainer.textContent = "";

    /*if(kandidati.length==0){
      kandidatiContainer.textContent='Nažalost nema prijavljenih kandidata za ovaj konkurs!'
      kandidatiContainer.style.alignContent='Center'
    }*/

    data.data.forEach((kandidat) => {
      if (kandidat.status_aplikacije == "Prijavljen") {
        brojacnepregledanih++; // Direktno ažurirate globalnu promenljivu
      }
      if (kandidat.status_aplikacije == "Pozvan na intervju") {
        brojactpozvanih++;
      }
      if (kandidat.status_aplikacije == "Odbijen") {
        brojacodbijenih++;
      }

      if (kandidat.status_aplikacije != "Otkazan") {
        const card = document.createElement("div");
        card.className = "card mb-3";
        card.style.width = "100%";

        if (
          kandidat.status_aplikacije === "Pozvan na intervju" ||
          kandidat.status_aplikacije === "Potvrdio dolazak na intervju"
        ) {

          const isoDate=kandidat.datum_intervjua
            const datum=new Date(isoDate)
            const formattedDate = `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;
          card.innerHTML = `
          <div class="card shadow-sm mb-3 border-0" style="border-radius: 12px;">
            <div class="row g-0">
              <!-- Sadržaj kartice -->
              <div class="col-md-10">
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary">${kandidat.ime} ${kandidat.prezime}</h5>
                  <p class="card-text text-muted"><strong>Email:</strong> ${kandidat.email}</p>
                   <p class="card-text">
                    <strong>Intervju zakazan datuma:</strong> 
                    ${formattedDate}
                  </p>
                  <p class="card-text"><span class="badge bg-info">${kandidat.status_aplikacije}</span></p>
                </div>
              </div>
        
              <!-- Pregled gumb -->
              <div class="col-md-2 d-flex align-items-center justify-content-center">
                <a href="/prikazkandidata?id_korisnika=${kandidat.id_korisnika}&id_konkursa=${kandidat.id_konkursa}" 
                  target="_blank" 
                  class="btn btn-primary btn-sm px-4 py-2">
                  Pregled
                </a>
              </div>
              
            </div>
          </div>
        `;

          kandidatiContainer.appendChild(card);
        } else {
          card.innerHTML = `
    <div class="card shadow-sm mb-3 border-0" style="border-radius: 12px;">
      <div class="row g-0">
        <!-- Sadržaj kartice -->
        <div class="col-md-10">
          <div class="card-body">
            <h5 class="card-title fw-bold text-primary">${kandidat.ime} ${
            kandidat.prezime
          }</h5>
            <p class="card-text text-muted"><strong>Email:</strong> ${
              kandidat.email
            }</p>
             <p class="card-text">
              <strong>Komentar:</strong> 
              ${
                kandidat.komentar && kandidat.komentar.trim() !== ""
                  ? kandidat.komentar
                  : "Niste dodali komentar kandidatu"
              }
            </p>
            <p class="card-text"><span class="badge bg-info">${
              kandidat.status_aplikacije
            }</span></p>
          </div>
        </div>
  
        <!-- Pregled gumb -->
        <div class="col-md-2 d-flex align-items-center justify-content-center">
          <a href="/prikazkandidata?id_korisnika=${
            kandidat.id_korisnika
          }&id_konkursa=${kandidat.id_konkursa}" 
            target="_blank" 
            class="btn btn-primary btn-sm px-4 py-2">
            Pregled
          </a>
        </div>
        
      </div>
    </div>
  `;

          kandidatiContainer.appendChild(card);
        }
      }
    });

    if (brojacnepregledanih == 0) {
      poruka.textContent = `Pregledali ste sve aplikante | pozvali ste ${brojactpozvanih} aplikanata na intervju | odbili ste ${brojacodbijenih} aplikanata`;
    } else {
      poruka.textContent = `Broj nepregledanih aplikanata: ${brojacnepregledanih} | pozvali ste ${brojactpozvanih} aplikanata na intervju | odbili ste ${brojacodbijenih} aplikanata.`;
    }
  }
});
