const Model = require("../model.js");

class Cards extends Model {
  constructor() {
    super("cards");
  }

  async getRandom(limit) {
    return await super.execute(
      `SELECT * FROM cards ORDER BY RAND() LIMIT ${limit}`
    );
  }
}

module.exports = Cards;
