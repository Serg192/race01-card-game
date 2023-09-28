const Model = require("../model.js");

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
    return await super.save({
      id: this.id,
      user_login: this.userLogin,
      user_password: this.userPassword,
      user_full_name: this.userFullName,
      user_email: this.userEmail,
    });
  }

  //function to map table row to user object
  mapFields(row) {
    
  }
}

module.exports = User;
