const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const props = require("./properties");

const AccountDetails = require("./models/account-details");
const UserCards = require("./models/user-cards");
const Cards = require("./models/cards");

function makeValidationResult(valid, message, data = null) {
  return {
    valid: valid,
    message: message,
    data: data,
  };
}

async function validateLoginData(jsonUserData) {
  let searchResult = await new User().findByLogin(jsonUserData.login);
  if (searchResult.length == 0) {
    return makeValidationResult(
      false,
      `User '${jsonUserData.login}' does not exist in the database`
    );
  } else {
    const passwd = searchResult[0].user_password;
    const isCorrectPassword = await bcrypt.compare(
      jsonUserData.password,
      passwd
    );
    if (!isCorrectPassword) {
      return makeValidationResult(false, "Password is not correct");
    }
  }
  return makeValidationResult(true, "OK");
}

async function validateRegistrationData(jsonUserData) {
  if (jsonUserData.password !== jsonUserData.confirmPassword) {
    return makeValidationResult(false, "Passwords do not match!");
  }

  if (!validator.isEmail(jsonUserData.email)) {
    return makeValidationResult(false, "Email is not valid!");
  }

  if (
    jsonUserData.login.length < props.MIN_LOGIN_LEN ||
    jsonUserData.login.length > props.MAX_LOGIN_LEN
  ) {
    return makeValidationResult(
      false,
      `The login should be at >= ${props.MIN_LOGIN_LEN} and <= ${props.MAX_LOGIN_LEN}`
    );
  }

  if (jsonUserData.password.length < props.MIN_PASSWORD_LEN) {
    return makeValidationResult(
      false,
      `Password should have at least ${props.MIN_PASSWORD_LEN} characters!`
    );
  }

  let searchResult = await new User().findByLogin(jsonUserData.login);
  if (searchResult.length != 0) {
    return makeValidationResult(
      false,
      `User '${jsonUserData.login}' already exists in the database`
    );
  }

  searchResult = await new User().findByEmail(jsonUserData.email);
  if (searchResult.length != 0) {
    return makeValidationResult(
      false,
      `Email '${jsonUserData.email}' already exists in the database`
    );
  }

  return makeValidationResult(true, "OK");
}

async function validateCardPurchase(userID, cardID) {
  const userCards = new UserCards();
  const accountDetails = new AccountDetails();
  const cards = new Cards();

  let uCardsArray = (await userCards.getUserCards(userID))[0];

  for (const card of uCardsArray) {
    if (card.id == cardID) {
      return makeValidationResult(false, "The user already has this card");
    }
  }

  if (cardID <= 0 || cardID > props.CARD_COUNT) {
    return makeValidationResult(false, "Card id is wrong!");
  }
  const userCoins = parseInt(
    (await accountDetails.findBy("user_id", userID))[0].user_coins
  );

  const test = await cards.findBy("id", cardID);

  const cardPrice = parseInt((await cards.findBy("id", cardID))[0].card_price);
  if (userCoins < cardPrice) {
    return makeValidationResult(false, "The user has insufficient coins");
  }

  return makeValidationResult(true, "OK", userCoins - cardPrice);
}

module.exports = {
  validateRegistrationData,
  validateLoginData,
  validateCardPurchase,
};
