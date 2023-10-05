const yourHand = document.querySelector(".cards-in-hand.your");
const yourBoardSection = document.querySelector(".board-section.your");
const opponentBoardSection = document.querySelector(".board-section.opponent");
const opponentHand = document.querySelector(".cards-in-hand");
const opponentFace = document.getElementById("opponent_img");

const myTimer = document.getElementById("your_time");
const opponentTimer = document.getElementById("opponent_time");

let socket = io(),
  login,
  playerImg,
  roomName,
  timer;

let myMove;
let myCards = [];

yourHand.addEventListener("dragstart", (event) => {
  const target = event.target;
  if (target.draggable) {
    event.dataTransfer.setData("text/plain", target.id);
    target.classList.add("dragging");
  }
});

yourHand.addEventListener("dragend", (event) => {
  const target = event.target;
  if (target.draggable) {
    target.classList.remove("dragging");
  }
});

yourBoardSection.addEventListener("dragover", (event) => {
  event.preventDefault();
});

yourBoardSection.addEventListener("drop", (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);

  if (yourBoardSection.contains(event.target) && draggableElement) {
    yourHand.removeChild(draggableElement);
    yourBoardSection.appendChild(draggableElement);
    const droppedCardId = draggableElement.dataset.cardId;
    socket.emit("card-dropped", {
      room: roomName,
      cardID: droppedCardId,
      localCardId: draggableElement.id,
    });
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

opponentFace.addEventListener("dragover", (event) => {
  event.preventDefault();
});

opponentFace.addEventListener("drop", (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);

  if (opponentFace.contains(event.target) && draggableElement) {
    draggableElement.style.display = "none";
  }
});

opponentBoardSection.addEventListener("dragover", (event) => {
  event.preventDefault();
});

function rectanglesIntersect(position, rect) {
  return (
    position.x > rect.left &&
    position.x < rect.right &&
    position.y < rect.bottom &&
    position.y > rect.top
  );
}

opponentBoardSection.addEventListener("drop", (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);

  if (draggableElement) {
    const dropX = event.clientX;
    const dropY = event.clientY;

    const containerRect = opponentBoardSection.getBoundingClientRect();
    const relativeX = dropX - containerRect.left;
    const relativeY = dropY;

    console.log(
      "Dropped card position (relative to container):",
      relativeX,
      relativeY
    );

    const opponentCards = opponentBoardSection.querySelectorAll(".card");
    opponentCards.forEach((opponentCard) => {
      const opponentCardRect = opponentCard.getBoundingClientRect();

      if (
        rectanglesIntersect({ x: relativeX, y: relativeY }, opponentCardRect)
      ) {
        handleAttack(draggableElement, opponentCard);
      }
    });

    opponentBoardSection.classList.remove("highlight");
    yourBoardSection.appendChild(draggableElement);
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
  // myCards.forEach((div) => {
  //   div.draggable = myMove;
  // });

  Array.from(yourBoardSection.children).forEach((card) => {
    card.draggable = myMove;
  });

  Array.from(yourHand.children).forEach((card) => {
    card.draggable = myMove;
  });
}

function onBackToLobby(event) {
  window.location.href = "/lobby";
}

//////////////////////////////////////////

let req = new XMLHttpRequest();
req.open("GET", `/game-api/account-info`, true);
req.addEventListener("load", () => {
  if (req.status == 200) {
    const resJSON = JSON.parse(req.responseText);
    login = resJSON[0].user_login;
    playerImg = resJSON[0].user_picture;
    document.getElementById("your-name").innerText = login;
    document.getElementById(
      "your-image"
    ).src = `/assets/profile-image/${playerImg}`;
    start();
  }
});
req.send();

function start() {
  const gameRunning = localStorage.getItem("gameRunning");
  if (gameRunning == null || gameRunning == false) {
    socket.emit("search-room", { login: login });
  } else {
    //roomName = localStorage.getItem("room");
    //HANDLE PAGE RELOAD
    //TEMPORARY
    socket.emit("search-room", { login: login });
  }
}

socket.on("connect_error", function (err) {
  console.log(err);
});

socket.on("room-found", (data) => {
  roomName = `${data.first} room`;
  //localStorage.setItem("room", room);
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

  socket.emit("my-picture", { room: roomName, picture: playerImg });
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
      cardElement.id = `${data.localCardId}`;
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

socket.on("opponent-attaks-my-card", (data) => {
  const { opCardId, opHP, myCardId, myNewHP } = data;

  console.log(opCardId, opHP);

  const opponentCardDiv = Array.from(opponentBoardSection.children).filter(
    (card) => card.id == opCardId
  )[0];

  const myCardDiv = Array.from(yourBoardSection.children).filter(
    (card) => card.id == myCardId
  )[0];

  if (opHP <= 0) {
    opponentBoardSection.removeChild(opponentCardDiv);
  } else {
    const opHpSpan = opponentCardDiv.querySelector("#card_health_txt");
    opHpSpan.textContent = `${opHP}`;
  }

  if (myNewHP <= 0) {
    yourBoardSection.removeChild(myCardDiv);
  } else {
    const myHpSpan = myCardDiv.querySelector("#card_health_txt");
    myHpSpan.textContent = `${myNewHP}`;
  }
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
        // myCards.push(cardElement);
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

function handleAttack(myCard, opponentCard) {
  const myAttack = parseInt(
    myCard.querySelector("#card_attack_txt").textContent
  );
  const opponentDefence = parseInt(
    opponentCard.querySelector("#card_defence_txt").textContent
  );

  const myLocalID = myCard.id;
  const opponentLocalId = opponentCard.id;

  console.log("My Attack: " + myAttack);
  console.log("Opponent defence: " + opponentDefence);

  const myHpSpan = myCard.querySelector("#card_health_txt");
  const opponentHpSpan = opponentCard.querySelector("#card_health_txt");

  const myHP = parseInt(myHpSpan.textContent);
  console.log("My HP: " + myHP);
  const opponentHP = parseInt(opponentHpSpan.textContent);
  console.log("Opponent HP: " + opponentHP);

  const myNewHP = myHP - opponentDefence;
  const opponentNewHP = opponentHP - myAttack;

  if (opponentNewHP <= 0) {
    opponentBoardSection.removeChild(opponentCard);
  } else {
    opponentHpSpan.textContent = `${opponentNewHP}`;
  }

  if (myNewHP <= 0) {
    yourBoardSection.removeChild(myCard);
  } else {
    myHpSpan.textContent = `${myNewHP}`;
  }

  socket.emit("card-card-attack", {
    room: roomName,
    opCardId: myLocalID,
    opHP: myNewHP,
    myCardId: opponentLocalId,
    myNewHP: opponentNewHP,
  });
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
