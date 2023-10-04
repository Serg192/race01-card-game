const yourHand = document.querySelector(".cards-in-hand.your");
const yourBoardSection = document.querySelector(".board-section.your");
const opponentBoardSection = document.querySelector(".board-section.opponent");
const opponentBoardCards = document.querySelectorAll(".board-section.opponent .card");
const opponentHand = document.querySelector(".cards-in-hand");
const opponentFace = document.getElementById("opponent_img");
console.log(opponentBoardCards);
const myTimer = document.getElementById("your_time");
const opponentTimer = document.getElementById("opponent_time");

yourHand.addEventListener("dragstart", (event) => {
  const target = event.target;
  if (yourHand.contains(target)) {
    event.dataTransfer.setData("text/plain", target.id);
    target.classList.add("dragging");
  }
});

yourHand.addEventListener("dragend", (event) => {
  const target = event.target;
  if (yourHand.contains(target)) {
    target.classList.remove("dragging");
  }
});

yourBoardSection.addEventListener('dragenter', (event) => {
  event.preventDefault();
  yourBoardSection.classList.add('dragover-highlight');
});


yourBoardSection.addEventListener("dragover", (event) => {
  yourBoardSection.classList.add("dragover-highlight");
  event.preventDefault();
});

yourBoardSection.addEventListener('dragleave', (event) => {
  yourBoardSection.classList.remove('dragover-highlight');
});

yourBoardSection.addEventListener("drop", (event) => {
  yourBoardSection.classList.remove("dragover-highlight");
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);

  if (yourBoardSection.contains(event.target) && draggableElement) {
    yourBoardSection.appendChild(draggableElement);
    const droppedCardId = draggableElement.dataset.cardId;
    socket.emit("card-dropped", { room: roomName, cardID: droppedCardId });
  }
});

yourBoardSection.addEventListener("dragstart", (event) => {
  const draggableElement = event.target;
  draggableElement.classList.add("dragging");
  event.dataTransfer.setData("text/plain", draggableElement.id);
});

yourBoardSection.addEventListener("dragend", (event) => {
  const draggableElement = event.target;
  draggableElement.classList.remove("dragging");
});

opponentBoardCards.forEach(card => {
  card.addEventListener('dragenter', (event) => {
    event.preventDefault();
    card.classList.add('dragover-highlight');
  });

  card.addEventListener("dragover", (event) => {
    card.classList.add("dragover-highlight");
    event.preventDefault();
  });
  
  card.addEventListener('dragleave', (event) => {
    card.classList.remove('dragover-highlight');
  });
  
  card.addEventListener("drop", (event) => {
    card.classList.remove("dragover-highlight");
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    const draggableElement = document.getElementById(data);
  
    if (card.contains(event.target) && draggableElement) {
      draggableElement.style.display = "none";
    }
  });
});

opponentFace.addEventListener('dragenter', (event) => {
  event.preventDefault();
  opponentFace.classList.add('dragover-highlight');
});

opponentFace.addEventListener("dragover", (event) => {
  opponentFace.classList.add("dragover-highlight");
  event.preventDefault();
});

opponentFace.addEventListener('dragleave', (event) => {
  opponentFace.classList.remove('dragover-highlight');
});

opponentFace.addEventListener("drop", (event) => {
  opponentFace.classList.remove("dragover-highlight");
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);

  if (opponentFace.contains(event.target) && draggableElement) {
    draggableElement.style.display = "none";
  }
});

// player-turn
const button = document.getElementById("turn-button");
button.addEventListener("click", togglePlayerTurn);

function togglePlayerTurn() {
  const text = button.textContent;
  console.log(text);
  if (text === "Your turn") {
    button.textContent = "Opponent's turn";
    button.setAttribute("disabled", true);
    socket.emit("next-turn", { room: roomName });
    if (opponentHand.childElementCount != 5) setOpponentDefaultCards(1);
    clearInterval(timer);
    myTimer.innerText = `00:30`;
    socket.emit("my-timer", { room: roomName, sec: 30 });
  } else {
    button.textContent = "Your turn";
    button.removeAttribute("disabled");
  }

  myMove = !myMove;
  myCards.forEach((div) => {
    div.draggable = myMove;
  });
}

function onBackToLobby(event) {
  window.location.href = "/lobby";
}

//////////////////////////////////////////

let socket = io(),
  login,
  playerImg,
  roomName,
  timer;

let myMove;
let myCards = [];

let req = new XMLHttpRequest();
req.open("GET", `/game-api/account-info`, false);
req.send();

if (req.status == 200) {
  const resJSON = JSON.parse(req.responseText);
  login = resJSON[0].user_login;
  playerImg = resJSON[0].user_picture;
  document.getElementById("your-name").innerText = login;
  document.getElementById(
    "your-image"
  ).src = `/assets/profile-image/${playerImg}`;
}

const gameRunning = localStorage.getItem("gameRunning");
if (gameRunning == null || gameRunning == false) {
  socket.emit("search-room", { login: login });
} else {
  roomName = localStorage.getItem("room");
  //HANDLE PAGE RELOAD
  //TEMPORARY
  socket.emit("search-room", { login: login });
}

socket.on("connect_error", function (err) {
  console.log(err);
});

socket.on("room-found", (data) => {
  room = `${data.first} room`;
  localStorage.setItem("room", room);
  localStorage.setItem("gameRunning", true);

  myMove = data.first === login;
  if (myMove) {
    button.textContent = "Your turn";
    button.removeAttribute("disabled");
    startTimer();
  } else {
    button.textContent = "Opponent's turn";
    button.setAttribute("disabled", true);
  }

  const searchBox = document.getElementById("game-search");
  const gameDiv = document.getElementById("game-container");

  searchBox.style.display = "none";
  gameDiv.style.display = "block";

  document.getElementById("opponent_name").innerText =
    data.first === login ? data.second : data.first;

  socket.emit("my-picture", { room: room, picture: playerImg });
});

socket.on("opponent-picture", (data) => {
  opponentFace.src = `/assets/profile-image/${data.picture}`;
  loadStartCards();
  setOpponentDefaultCards();
});

socket.on("opponent-dropped-a-card", (data) => {
  let req = new XMLHttpRequest();
  req.open("GET", `/game-api/card?id=${data.cardID}`, false);
  req.addEventListener("load", () => {
    if (req.status == 200) {
      const card = JSON.parse(req.responseText);
      const cardElement = document.createElement("div");
      cardElement.draggable = true;
      if (card.card_class === "healer") {
        cardElement.className = "card healer";
      } else if (card.card_class === "tankman") {
        cardElement.className = "card tankman";
      } else if (card.card_class === "dps") {
        cardElement.className = "card dps";
      }
      cardElement.innerHTML = createCardHTML(card);
      cardElement.id = `${uid()}`;
      cardElement.setAttribute("data-card-id", card.id);
      cardElement.addEventListener("click", () => {
        handleCardClick(cardElement);
      });
      console.log(cardElement);
      opponentBoardSection.appendChild(cardElement);
      opponentHand.removeChild(opponentHand.firstChild);
    }
  });
  req.send();
});

socket.on("my-turn", (data) => {
  togglePlayerTurn();
  if (yourHand.childElementCount != 5) {
    fetchOneCard();
  }
  startTimer();
});

socket.on("opponent-timer", (data) => {
  opponentTimer.innerText = `00:${String(data.sec).padStart(2, "0")}`;
});

function loadPlayerCards(count, clear = true) {
  let req = new XMLHttpRequest();
  req.open("GET", `/game-api/player-rand-card?count=${count}`, true);
  req.setRequestHeader("Conteznt-Type", "application/json");
  req.addEventListener("load", () => {
    if (req.status == 200) {
      const resJSON = JSON.parse(req.responseText);
      if (clear) yourHand.innerHTML = "";
      resJSON.forEach((card) => {
        const cardElement = document.createElement("div");
        cardElement.draggable = myMove;
        if (card.card_class === "healer") {
          cardElement.className = "card healer";
        } else if (card.card_class === "tankman") {
          cardElement.className = "card tankman";
        } else if (card.card_class === "dps") {
          cardElement.className = "card dps";
        }
        cardElement.innerHTML = createCardHTML(card);
        cardElement.id = `${uid()}`;
        cardElement.setAttribute("data-card-id", card.id);
        cardElement.addEventListener("click", () => {
          handleCardClick(cardElement);
        });
        yourHand.appendChild(cardElement);
        myCards.push(cardElement);
      });
    }
  });
  req.send();
}

function fetchOneCard() {
  loadPlayerCards(1, false);
}

function loadStartCards() {
  loadPlayerCards(5);
}

function setOpponentDefaultCards(count = 5) {
  for (let i = 0; i < count; i++) {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    opponentHand.appendChild(cardElement);
  }
}

function startTimer() {
  let sec = 30;
  myTimer.innerText = `00:${sec}`;
  timer = setInterval(() => {
    sec -= 1;
    if (sec < 0) {
      clearInterval(timer);
      socket.emit("my-timer", { room: roomName, sec: 30 });
      togglePlayerTurn();
    } else {
      myTimer.innerText = `00:${String(sec).padStart(2, "0")}`;
      socket.emit("my-timer", { room: roomName, sec: sec });
    }
  }, 1000);
}

function createCardHTML(card) {
  const {
    card_name,
    card_class,
    card_attack,
    card_defence,
    card_health,
    card_usage_price,
    card_price,
    card_picture,
  } = card;
  return `
      <img id="card_picture" src="/assets/characters/${card_picture}" alt="Card Picture" draggable="false" />
      <span id="card_class_txt">${card_class}</span>
      <span id="card_attack_txt">${card_attack}</span>
      <span id="card_defence_txt">${card_defence}</span>
      <span id="card_health_txt">${card_health}</span>
      <span id="card_usage_price_txt">${card_usage_price}</span>
      <span id="card_name_txt">${card_name}</span>`;
}

const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
