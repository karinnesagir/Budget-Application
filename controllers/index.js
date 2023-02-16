const router = require('express').Router();
const apiRoutes = require('./api');
const { User, Budget, Expense, BudgetCategory } = require('../models');
const withAuth = require('../utils/auth');
const homeRoutes = require("./homeRoutes")

router.use('/api', apiRoutes);
router.use('/', homeRoutes);

// router.use((req, res) => {
//   res.send("<h1>Wrong Route!</h1>")
// });

module.exports = router;