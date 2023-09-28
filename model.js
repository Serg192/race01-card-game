const pool = require("./db.js");

class Model {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
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

  async delete(id) {
    if (await this.find(id)) {
      const connection = await pool.getConnection();
      try {
        await connection.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [
          id,
        ]);
        return true;
      } catch (e) {
        return false;
      } finally {
        connection.release();
      }
    }
    return false;
  }

  async save(data) {
    let operationSuccess = true;

    const connection = await pool.getConnection();
    try {
      if (data.id) {
        await connection.query(`UPDATE ${this.tableName} SET ? WHERE id = ?`, [
          data,
          data.id,
        ]);
      } else {
        await connection.query(`INSERT INTO ${this.tableName} SET ?`, data);
      }
    } catch (err) {
      operationSuccess = false;
    } finally {
      connection.release();
    }
    return operationSuccess;
  }
}

module.exports = Model;
