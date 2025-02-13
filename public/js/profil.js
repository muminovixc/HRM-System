const loadingIndicator = document.querySelector(".loading-container");
document.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault();

  const jwtToken = localStorage.getItem("jwt");
  console.log(jwtToken);
  const res1 = await fetch("http://localhost:3000/profil/jwtAuth", {
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

  const ime1 = localStorage.getItem("ime");
  console.log("ime" + ime1);

  const ime = document.getElementById("ime");
  const id = localStorage.getItem("id");

  const username = document.getElementById("username");
  const ime2 = document.getElementById("ime2");
  const prezime = document.getElementById("prezime");
  const email = document.getElementById("email");
  const vjestine = document.getElementById("vjestine");
  const github = document.getElementById("github");
  const Edukacija = document.getElementById("edukacijaa");
  console.log(id);
  const res = await fetch("http://localhost:3000/profil/podaci", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  loadingIndicator.style.display = "block";
  const data = await res.json();
  console.log(data);

  if (data.success) {
    const container = document.getElementById("cvContainer");
    const cvLink = document.createElement("a");
    loadingIndicator.style.display = "none";
    if (data.data.cv) {
     
      cvLink.href = `data:application/pdf;base64,${data.data.cv}`;
      cvLink.download = "CV.pdf";
      cvLink.className =
        " col-12 btn btn-outline-primary px-4 py-3 fw-bold shadow-sm";
      cvLink.textContent = "📄 Preuzmi CV";

      const icon = document.createElement("i");
      icon.className = "bi bi-download ms-2";
      cvLink.appendChild(icon);
      container.appendChild(cvLink);
    } else {
      cvLink.textContent = "📄 Niste unijeli CV";
      container.appendChild(cvLink);
    }

    ime2.innerHTML = data.data.ime;
    prezime.innerHTML = data.data.prezime;
    email.innerHTML = data.data.email;
    username.innerHTML = data.data.username;
    vjestine.innerHTML = data.data.vjestine;
    github.innerHTML = data.data.github;
    Edukacija.innerHTML = data.data.edukacija;
  }
});

async function azuriraj(e) {
  e.preventDefault();
  console.log("azuriraj");

  const getValueOrNull = (id) => {
    const element = document.getElementById(id);
    console.log(element);
    if (!element) return null; // Ako element nije pronađen, vrati null

    if (element.type === "file") {
      return element.files[0] || null; // Za fajl polja vrati fajl ili null
    }

    return element.value.trim() === "" ? null : element.value.trim(); // Ako je vrednost prazna, vrati null
  };

  // Prikupljanje vrednosti iz input polja
  const ime = getValueOrNull("imee");
  const prezime = getValueOrNull("prezime1");
  const username1 = getValueOrNull("username1");
  const vjestine = getValueOrNull("vjestine");
  const github1 = getValueOrNull("github1");
  const cv = getValueOrNull("cv1");
  const edukacija = getValueOrNull("edukacija");
  const id = localStorage.getItem("id");

  const formData = new FormData();

  // Dodaj samo one vrednosti koje nisu null
  if (ime !== null) formData.append("ime", ime);
  if (prezime !== null) formData.append("prezime", prezime);
  if (username1 !== null) formData.append("username", username1);
  if (vjestine !== null) formData.append("vjestine", vjestine);
  if (github1 !== null) formData.append("github", github1);
  if (cv !== null) formData.append("cv", cv);
  if (edukacija !== null) formData.append("edukacija", edukacija);
  formData.append("id", id);

  console.log(formData);

  const res = await fetch("http://localhost:3000/profil/azuriranje", {
    method: "PUT",
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    console.log("Podaci su uspješno ažurirani");
    location.reload();
  } else {
    alert("Došlo je do greške!");
  }
}
