// Učitavanje korisnika i provjera autentifikacije
document.addEventListener("DOMContentLoaded", async () => {
  const jwtToken = localStorage.getItem("jwt");
  console.log("JWT Token:", jwtToken);

  // Provjera autentifikacije
  const authResponse = await fetch("/statistika/jwtAuth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!authResponse.ok) {
    localStorage.removeItem("jwt");
    location.assign("/");
    return;
  }

  const bar = document.getElementById("bar-chart");
  const bar2 = document.getElementById("bar-chart2");
  const bar3 = document.getElementById("bar-chart3");
  const res = await fetch("/statistika/analiza", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  if (data.success) {
    const loadingIndicator = document.querySelector(".loading-container");
    loadingIndicator.style.display = "none";
    const konkursi = data.data;
    console.log(konkursi);

    konkursi.forEach((konkurs) => {
      let div = document.createElement("div");
      div.classList.add("bar");
      div.style.height = `${konkurs.broj_aplikanata * 10}%`;
      div.title = `${konkurs.naziv} ${konkurs.broj_aplikanata}`;
      div.textContent = `${konkurs.naziv}`;

      bar.appendChild(div);

      let div2 = document.createElement("div");
      div2.classList.add("bar");
      div2.style.height = `${konkurs.prosjek}%`;
      div2.title = `${konkurs.prosjek}`;
      div2.textContent = `${konkurs.naziv}`;

      bar2.appendChild(div2);
    });
  }
  const res2 = await fetch(
    "/statistika/analizakandidata",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  const data2 = await res2.json();
  if (data2.success) {
    const konkursi2 = data2.data;
    console.log(konkursi2);

    konkursi2.forEach((konkurs) => {
      let div3 = document.createElement("div");
      div3.classList.add("bar");
      div3.style.height = `${konkurs.prosjecna_ocjena * 10}%`;
      div3.title = `${konkurs.ime} ${konkurs.prezime} ${konkurs.prosjecna_ocjena}`;
      div3.textContent = `${konkurs.ime} ${konkurs.prezime}`;

      bar3.appendChild(div3);
    });
  }
});

async function generisiPDFStatistika(event) {
  event.preventDefault();

  const res = await fetch("/statistika/analiza", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  let x =0;
let y = 40;
const { jsPDF } = window.jspdf;
const pdf = new jsPDF();
pdf.setFontSize(15);
pdf.text(`Statistika`, 80, 20);
pdf.addImage('images/hr.png', 'PNG', 10, 10, 10, 10);

if (data.success) {
  const konkursi = data.data;

  konkursi.forEach((konkurs) => {
    const broj=konkurs.prosjek;
    const zaokruzeno = Math.round(broj * 100) / 100;
    const naslov= konkurs.naziv;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textWidth = pdf.getTextWidth(naslov);
    const z = (pageWidth - textWidth) / 2;
    pdf.setFont('helvetica', 'bold');
    pdf.text(naslov, z, y)
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Broj prijavljenih kandidata: ${konkurs.broj_aplikanata}`,0,y+7)
    pdf.text(`Prosjecno vrijeme popunjavanja: ${zaokruzeno} sekundi`,0,y+15)
    pdf.line(10, 25, 200, 25); // (x1, y1, x2, y2)

    pdf.line(0,y+20,210,y+20)

    // Razmak između konkursa
    y +=30;

    if (y > 280) {
      pdf.addPage();
      y = 10; 
    }
  });

  pdf.save('Statistika.pdf');
}

}
