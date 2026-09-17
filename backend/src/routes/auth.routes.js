const { Router } = require('express');
const { resolveIdentifier } = require('../controllers/auth.controller');

const router = Router();

router.post('/resolve', resolveIdentifier);

module.exports = router;
