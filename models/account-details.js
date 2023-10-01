const Model = require("../model.js");

class AccountDetails extends Model {
  user_id = null;

  constructor() {
    super("account_details");
  }

  async createEntryFor(id) {
    return await super.create({
      user_id: id,
    });
  }

  async update(data) {
    return (
      (await super.execute(
        `UPDATE account_details SET ? WHERE user_id = ?`,
        data
      )) != null
    );
  }

  async setPicture(picture) {
    return await this.update([
      {
        user_picture: picture,
      },
      this.user_id,
    ]);
  }

  async setCoins(coins) {
    return await this.update([
      {
        user_coins: coins,
      },
      this.user_id,
    ]);
  }

  async setWins(wins) {
    return await this.update([
      {
        user_wins: wins,
      },
      this.user_id,
    ]);
  }

  async setLosses(losses) {
    return await this.update([
      {
        user_losses: losses,
      },
      this.user_id,
    ]);
  }
}

module.exports = AccountDetails;
