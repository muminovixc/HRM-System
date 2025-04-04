
const socket = io(); // Povezivanje sa Socket.IO serverom
const notifikacija=document.getElementById('notifikacija')
document.addEventListener("DOMContentLoaded", async () => {
  const jwtToken = localStorage.getItem("jwt");

  const res1 = await fetch("/chat/jwtAuth", {
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

  try {
    // Preuzimanje liste korisnika
    const res = await fetch("/chat/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      const loadingIndicator = document.querySelector(".loading-container");
      loadingIndicator.style.display = "none";
      const userList = document.getElementById("user-list");
      userList.innerHTML = ""; // Očisti postojeće korisnike

      // Popuni listu korisnika
      data.data.forEach((user) => {
        if (user.id_korisnika != 1) {
          const userItem = document.createElement("li");
          userItem.innerHTML = `<button class="user" data-id="${user.id_korisnika}">
                    ${user.ime} ${user.prezime}
                </button>`;
          userList.appendChild(userItem);
        }
      });
    } else {
      console.error("Greška pri preuzimanju liste korisnika.");
    }
  } catch (error) {
    console.error("Greška pri komunikaciji sa serverom:", error);
  }

  document.getElementById("user-list").addEventListener("click", async (e) => {
    if (e.target.classList.contains("user")) {
      const toUserId = e.target.getAttribute("data-id");
      const userName = e.target.innerText;
      const fromUserId = localStorage.getItem("id");

      // Prikaz chata i postavljanje korisničkog ID-a
      document.getElementById("chat").style.display = "block";
      document.getElementById("chat-header").innerText = `${userName}`;
      document.getElementById("chat-header").setAttribute("data-id", toUserId);

      document.getElementById("messages").innerHTML = ""; // Očisti prethodne poruke

      try {
        // Dohvati sve prethodne poruke
        const res = await fetch(
          `/chat/get-messages?fromUserId=${fromUserId}&toUserId=${toUserId}`
        );
        const data = await res.json();

        if (data.success) {
          const messagesDiv = document.getElementById("messages");

          data.messages.forEach((msg) => {
            const ime = localStorage.getItem("ime");
            const messageElement = document.createElement("div");
            const senderName =
              msg.ime === ime ? "Vi" : `${msg.ime} ${msg.prezime}`;
            messageElement.innerHTML = `<strong>${senderName}</strong>: ${msg.poruka}`;
            messagesDiv.appendChild(messageElement);
          });

          // Automatski scroll na kraj
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } else {
          console.error("Greška pri dohvaćanju poruka:", data.error);
        }
      } catch (error) {
        console.error("Greška pri komunikaciji sa serverom:", error);
      }
    }
  });

  // Slanje poruke
  document
    .getElementById("send-message")
    .addEventListener("click", async () => {
      const message = document.getElementById("message").value.trim();
      const fromUserId = localStorage.getItem("id"); // ID trenutnog korisnika
      const toUserId = document
        .getElementById("chat-header")
        .getAttribute("data-id");

      if (!message) return; // Ne šalji prazne poruke

      try {
        console.log(toUserId);
        const res = await fetch("/chat/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromUserId, toUserId, message }),
        });

        const data = await res.json();

        if (data.success) {
          console.log(toUserId);
          // Emituj novu poruku preko Socket.IO
          socket.emit("new-message", { message, fromUserId, toUserId });
          document.getElementById("message").value = ""; // Očisti unos
        } else {
          alert("Greška pri slanju poruke.");
        }
      } catch (error) {
        console.error("Greška pri slanju poruke:", error);
      }
    });

  // Prikazivajne poruka
  socket.on("receive-message", (data) => {
    
    const ime = localStorage.getItem("ime");
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    const senderName = data.sender === ime ? "Vi" : `${data.sender}`;
    if(data.sender!==ime){
      notifikacija.play()
    }
    messageElement.innerHTML = `<strong>${senderName}</strong>: ${data.message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});
