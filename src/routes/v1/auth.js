const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const { dbConfig } = require('../../config.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const userSchema = Joi.object({
  full_name: Joi.string(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(3).max(30).required(),
});

//Registration
router.post('/register', async (req, res) => {
  let userInput = req.body;
  try {
    userInput = await userSchema.validateAsync(userInput);
  } catch (err) {
    return res.status(400).send({ err: 'Incorrect data provided' });
  }

  const encryptedPassword = bcrypt.hashSync(userInput.password);

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
      INSERT INTO users (full_name, email, password)
      VALUES (${mysql.escape(userInput.full_name)}, ${mysql.escape(userInput.email)}, '${encryptedPassword}')`);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Internal Server Error' });
  }
});

//Login
router.post('/login', async (req, res) => {
  let userInput = req.body;

  try {
    userInput = await userSchema.validateAsync(userInput);
  } catch (err) {
    return res.status(400).send({ err: 'Incorrect email or pass' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
      SELECT id, email, password 
      FROM users 
      WHERE email = ${mysql.escape(userInput.email)}`);
    await con.end();

    const answer = bcrypt.compareSync(userInput.password, data[0].password);

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, process.env.JWT_SECRET);
    return answer ? res.send({ msg: 'Login successfully', token }) : res.status(400).send({ err: 'Incorrect data email or pass' });
  } catch (err) {
    return res.status(500).send({ err: 'Internal Server Error' });
  }
});

module.exports = router;
