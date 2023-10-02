const Model = require("../model.js");

class AccountDetails extends Model {
  user_id = null;

  constructor() {
    super("account_details");
  }

  async getFullAccountInfo(userID) {
    return await super.execute(`
      SELECT
        users.id,
        users.user_login,
        users.user_email,
        account_details.user_picture,
        account_details.user_coins,
        account_details.user_wins,
        account_details.user_losses
      FROM
        users
      JOIN
        account_details ON users.id = account_details.user_id
      WHERE
        users.id = ${userID}`);
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
