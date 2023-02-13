const router = require('express').Router();
const { Budget, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/profile', withAuth, async (req, res) => {
  // console.log(req.session)
  try {
    const userData = await User.findByPk(req.session.user_id, {
      include: [{ model: Budget }],
    });

    const user = userData.get({ plain: true });
    console.log(user)

    res.render('profile', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get('/login',(req, res) => {
  // console.log(req.session.logged_in)
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});


//HOMEPAGE ROUTE
router.get('/', (req, res) => {
  res.render('homepage');
});

// THIS IS PROFILE PAGE, WHICH CAN BE OUR HOME PAGE AFTER LOGGING IN


//USER WILL BE DIRECTED TO SIGNUP PAGE
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/goals', (req, res) => {
  res.render('goals');
});

module.exports = router;
