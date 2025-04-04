document
  .getElementById("registracija")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const ime = document.getElementById("ime").value;
    const prezime = document.getElementById("prezime").value;
    const email = document.getElementById("registracijaemail").value;
    const sifra = document.getElementById("registracijasifra").value;
    const poruka = document.getElementById("poruka");
    const porukai = document.getElementById("porukai");
    const porukap = document.getElementById("porukap");
    const porukae = document.getElementById("porukae");
    const porukas = document.getElementById("porukas");

    if (!ime || !prezime || !email || !sifra) {
      poruka.innerHTML = "Sva polja su obavezna";
    }

    if (ime.length > 50) {
      porukai.innerHTML = "Ime ne smije imati vise od 50 karaktera!";
    }

    if (prezime.length > 50) {
      porukap.innerHTML = "Prezime ne smije imati više od 50 karaktera!";
    }

    if (!email.includes("@")) {
      porukae.innerHTML = "Nepravilno unesen Email";
    }
    if (sifra.length < 8) {
      porukas.innerHTML = "Sifra ne smije imati manje od 8 karaktera!";
    } else {
      const res = await fetch("/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, prezime, email, sifra }),
      });

      const data = await res.json();

      if (data.success == false) {
        poruka.innerHTML = data.message;
        poruka.style.backgroundColor = "red";
      } else {
        poruka.innerHTML = data.message;

        setTimeout(location.assign("/"), 2000);
      }
    }
  });
