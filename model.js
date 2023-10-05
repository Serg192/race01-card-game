const pool = require("./db.js");

class Model {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findBy(key, value) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT * FROM ${this.tableName} WHERE ${key} = ?`,
        [value]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async delete(id, idname = "id") {
    if (await this.find(id)) {
      const connection = await pool.getConnection();
      try {
        await connection.query(
          `DELETE FROM ${this.tableName} WHERE ${idname} = ?`,
          [id]
        );
        return true;
      } catch (e) {
        return false;
      } finally {
        connection.release();
      }
    }
    return false;
  }

  async create(data) {
    let opResult = null;
    const connection = await pool.getConnection();
    try {
      opResult = await connection.query(
        `INSERT INTO ${this.tableName} SET ?`,
        data
      );
    } catch (err) {
      console.error(err);
    } finally {
      connection.release();
    }

    return opResult;
  }

  async update(data, idname = "id") {
    return await this.execute(
      `UPDATE ${this.tableName} SET ? WHERE ${idname} = ?`,
      data
    );
  }

  async execute(query, params = []) {
    let opResult = null;
    const connection = await pool.getConnection();
    try {
      opResult = await connection.query(query, params);
    } catch (err) {
      console.error(err);
    } finally {
      connection.release();
    }
    return opResult;
  }
}

module.exports = Model;
