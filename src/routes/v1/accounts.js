const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const { loggedIn } = require('../../middleware.js');
const { dbConfig } = require('../../config.js');

//Post to accounts by user id
router.post('/accounts', loggedIn, async (req, res) => {
  const { group_id } = req.body;
  if (!group_id) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `
    INSERT INTO accounts (group_id, user_id)
    VALUES (${mysql.escape(group_id)}, '${mysql.escape(req.userData.id)}')`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Please try again' });
  }
});

//Get data by user id
router.get('/accounts', loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `
    SELECT groups.id, groups.name, accounts.group_id, accounts.user_id
        FROM groups
        LEFT JOIN accounts
        ON groups.id = accounts.group_id
        WHERE user_id = '${req.userData.id}'
      `;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Internal Server Error' });
  }
});

module.exports = router;
