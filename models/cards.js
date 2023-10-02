const Model = require("../model.js");

class Cards extends Model {
  // cardID = null;

  constructor() {
    super("cards");
  }

  // async getCardData(cardID) {
  //   return await super.execute(`
  //     SELECT
  //       cards.id,
  //       cards.card_name,
  //       cards.card_class,
  //       cards.card_attack,
  //       cards.card_defence,
  //       cards.card_health,
  //       cards.card_usage_price,
  //       cards.card_price,
  //       cards.card_picture
  //     FROM
  //       cards
  //     WHERE
  //       users.id = ${cardID}`);
  // }

  async getRandom(limit) {
    return await super.execute(
      `SELECT * FROM cards ORDER BY RAND() LIMIT ${limit}`
    );
  }
}

module.exports = Cards;
