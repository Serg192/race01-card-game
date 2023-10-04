const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const router = express.Router();

const AccountDetails = require("../models/account-details");
const UserCards = require("../models/user-cards");
const Cards = require("../models/cards");

const { validateCardPurchase } = require("../validation");

const props = require("../properties");

router.get("/account-info", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;
  res
    .status(200)
    .json((await new AccountDetails().getFullAccountInfo(userID))[0]);
});

router.get("/store-items", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;
  res.status(200).json((await new UserCards().getNotOwnedCards(userID))[0]);
});

router.get("/player-cards", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;
  res.status(200).json((await new UserCards().getUserCards(userID))[0]);
});

router.get("/player-rand-card", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;
  const count = req.query.count;
  res
    .status(200)
    .json(
      (
        await new UserCards().getRandomUserCard(
          userID,
          count == undefined ? 1 : count
        )
      )[0]
    );
});

router.post("/buy-card", async (req, res) => {
  const userID = jwt.decode(req.cookies.token).id;
  const cardID = req.body.iteamID;

  const validationResult = await validateCardPurchase(userID, cardID);

  if (!validationResult.valid) {
    res.status(400).json({
      message: validationResult.message,
    });
  } else {
    const details = new AccountDetails();
    details.user_id = userID;
    await details.setCoins(validationResult.data);
    new UserCards().create({
      user_id: userID,
      card_id: cardID,
    });

    res.status(200).json({});
  }
});

router.get("/card", async (req, res) => {
  const cardID = req.query.id;
  if (cardID < 0 || cardID > props.CARD_COUNT) {
    res
      .status(400)
      .json({ message: `Id is out of range 0 <= id <= ${props.CARD_COUNT}` });
  } else {
    res.status(200).json((await new Cards().findBy("id", cardID))[0]);
  }
});

module.exports = router;
