const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const props = require("./properties");

function makeValidationResult(valid, message) {
  return {
    valid: valid,
    message: message,
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

module.exports = { validateRegistrationData, validateLoginData };
