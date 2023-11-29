const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsNatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
      <p>${number}</p>
      <img src="${symbol}"/>
      <p>${number}</p>`;
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    // Array(52).keys()，產生有52個元素的陣列。
    // .join('')把陣列合併成一個大字串，因為HTML不吃陣列。
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    //如果是正面，回傳背面
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 如果是背面，回傳正面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  pairCard(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,

  triedTimes: 0,
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        if (model.isRevealedCardsMatched()) {
          // 配對正確
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCard(...model.revealedCards);
          model.revealedCards = [];
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("current state:", this.currentState);
    console.log("revealed cards:", model.revealedCards);
  },

  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (e) => {
    controller.dispatchCardAction(card);
  });
});
