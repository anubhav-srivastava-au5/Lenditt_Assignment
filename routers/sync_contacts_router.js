const { Router } = require('express');
const syncContacts = require('../controllers/syncContacts')

const app = Router();
app.post('/api/syncContacts', syncContacts);

module.exports = app;