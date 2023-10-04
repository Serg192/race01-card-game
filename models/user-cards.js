const Model = require("../model.js");

class UserCards extends Model {
  constructor() {
    super("user_cards");
  }

  async getUserCards(userId) {
    return await super.execute(
      `SELECT cards.* FROM user_cards
       LEFT JOIN cards ON user_cards.card_id = cards.id
       WHERE user_cards.user_id = ${userId}`
    );
  }

  async getRandomUserCard(userId, count = 1) {
    return await super.execute(
      `SELECT cards.*
       FROM user_cards 
       LEFT JOIN cards ON user_cards.card_id = cards.id
       WHERE user_cards.user_id = ${userId}
       ORDER BY RAND()
       LIMIT ${count}`
    );
  }

  // async getNotOwnedCards(userId) {
  //   return await super.execute(
  //     `SELECT * FROM cards LEFT JOIN user_cards ON cards.id = user_cards.user_id AND user_cards.user_id = ${userId}
  //     WHERE user_cards.user_id IS NULL`
  //   );
  // }

  // Rewritten to select only those, that certain player doesn't have
  async getNotOwnedCards(userId) {
    return await super.execute(
      `SELECT * FROM cards WHERE id NOT IN (
        SELECT card_id FROM user_cards WHERE user_id = ${userId}
      )`
    );
  }
}

module.exports = UserCards;
