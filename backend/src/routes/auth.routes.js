const { Router } = require('express');
const { resolveIdentifier, signup } = require('../controllers/auth.controller');

const router = Router();

router.post('/resolve', resolveIdentifier);
router.post('/signup', signup);

module.exports = router;
