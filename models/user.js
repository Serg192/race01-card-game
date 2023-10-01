const Model = require("../model.js");
const AccountDetails = require("./account-details");
const Cards = require("../models/cards.js");
const UserCards = require("../models/user-cards.js");
const props = require("../properties.js");

class User extends Model {
  constructor({
    id = null,
    userLogin = null,
    userFullName = null,
    userEmail = null,
    userPassword = null,
  } = {}) {
    super("users");
    this.id = id;
    this.userLogin = userLogin;
    this.userPassword = userPassword;
    this.userFullName = userFullName;
    this.userEmail = userEmail;
  }

  async findByLogin(login) {
    return await super.findBy("user_login", login);
  }

  async findByEmail(email) {
    return await super.findBy("user_email", email);
  }

  async save() {
    let userData = {
      id: this.id,
      user_login: this.userLogin,
      user_password: this.userPassword,
      user_full_name: this.userFullName,
      user_email: this.userEmail,
    };

    let result = null;
    if (this.id == null) {
      result = await super.create(userData);
      if (result != null) {
        new AccountDetails().createEntryFor(result[0].insertId);
        const cards = new Cards();
        const uCards = new UserCards();
        (await cards.getRandom(props.DEFAULT_CARD_NUMBER))[0].forEach(
          (card) => {
            uCards.create({
              user_id: result[0].insertId,
              card_id: card.id,
            });
          }
        );
      }
    } else {
      return (await super.update([userData, this.id])) != null;
    }

    return result != null;
  }
}

module.exports = User;
