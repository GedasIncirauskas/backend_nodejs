const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const { loggedIn } = require('../../middleware.js');
const { dbConfig } = require('../../config.js');

//Get bills by group id
router.get('/bills/:id?', loggedIn, async (req, res) => {
  const id = req.params.id || '';
  const query = `
    SELECT * FROM bills  
    ${id && `WHERE group_id = '${req.params.id}'`}
    `;
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Internal Server Error' });
  }
});

//Post to bills
router.post('/bills', loggedIn, async (req, res) => {
  const { group_id, amount, description } = req.body;
  if (!group_id || !amount || !description) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO bills (group_id, amount, description)
      VALUES (${mysql.escape(group_id)}, ${mysql.escape(amount)}, ${mysql.escape(description)})`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Please try again' });
  }
});

module.exports = router;
