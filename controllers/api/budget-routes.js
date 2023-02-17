const router = require('express').Router();
const { Budget, User, BudgetCategory, Expense } = require('../../models');
const withAuth = require('../../utils/auth');

// Get all budgets for a user
router.get('/', withAuth, async (req, res) => {
  try {
    const budgetData = await Budget.findAll({
      where: { user_id: req.session.user_id },
      attributes: ['category_id', 'amount', 'date_created']
    });

    // Get Budget cateories
    const nameData = await BudgetCategory.findAll({
      attributes: ['category'],
    });
    const names = nameData.map((name) => name.get({ plain: true }));

    const budgets = budgetData.map((budget) => budget.get({ plain: true }));

    //add category_name to the data send to goals.handlebar for displaying
    budgets.forEach((budget) => {
      budget.category_name = names[budget.category_id - 1].category;
    });

    res.status(200).json(budgets);

  } catch (err) {
    res.status(500).json(err);
  }
});

// Added a route to get data to display budget goals for a user
router.get('/goals', withAuth, async (req, res) => {

  try {

    //Get current budgets goals for the user);

    const budgetData = await Budget.findAll({
      where: { user_id: req.session.user_id },
      attributes: ['category_id', 'amount', 'fund_remaining', 'date_created', 'id']
    });

    //Get the User Data
    const userData = await User.findByPk(req.session.user_id, {
      attributes: ['name']
    });
    const user = userData.get({ plain: true })


    // Get Budget cateories
    const nameData = await BudgetCategory.findAll({
      attributes: ['category'],
    });

    const expenseData = await Expense.findAll({
      attributes: ['amount_spent'],
    });


    const names = nameData.map((name) => name.get({ plain: true }));

    const budgets = budgetData.map((budget) => budget.get({ plain: true }));

    const expenses = expenseData.map((expense) => expense.get({ plain: true }));


    //add category_name to the data send to goals.handlebar for displaying
    budgets.forEach((budget) => {
      budget.category_name = names[budget.category_id - 1].category;
      // replace the fund remaining in the actual db
      fund_remaining = budgets[0].amount - expenses[0].amount_spent;
      Budget.update(fund_remaining, {where: { id: budget.id}})
      .then(
        data => {
          console.log("db update", data)
        }
      )
      .catch(err => console.error(err))
      console.log("BUDGET DATAAAAAAAAAAAAAAAAAA",fund_remaining)
    });

    const budgetData2 = await Budget.findAll({
      where: { user_id: req.session.user_id },
      attributes: ['category_id', 'amount', 'fund_remaining', 'date_created', 'id']
    });

    const budgets2 = budgetData.map((budget) => budget.get({ plain: true }));
    
// //
    // const budget = budgetData.map((items)=>items.get({plain:true}))


    // // console.log('@@@@@@@@@@@@@@@@@@@',parseInt(budget))\
    
    // const budgetAmount = budgets[0].amount
    // console.log("------------------------",expenses)

    // const expenses = expenseData.map((expense) => expense.get({ plain: true }));

    // console.log('@@@@@@@@@@',expenses[0].amount_spent)


    // budgets.fund_remaining = Number(expenses[0].amount_spent);
    // budgets[0].amount - expenses[0].amount_spent
    console.log("00000000000000000",expenses[0].amount_spent)
    console.log("----------------",budgets[0].amount)


    // console.log("00000000000000000",expenses[0].amount_spent)
    // console.log("----------------",budgets[0].amount)
 
    // console.log("BUDGET DATAAAAAAAAAAAAAAAAAA",budgets.fund_remaining)

//

    //call the goals.handlebar to display
    res.render('goals', {
      budgets2, user,
      logged_in: true,
    });

  } catch (err) {
    res.status(500).json(err);
  }

});

// Get a budget with given category_id and user_id
router.get('/:id', withAuth, async (req, res) => {
  console.log(req.body)
  try {
    const budgetData = await Budget.findAll({
      where: { user_id: req.session.user_id, category_id: req.params.id },
      attributes: ['amount', 'fund_remaining']
    });

    const budgets = budgetData.map((budget) => budget.get({ plain: true }));
    console.log("**********Get CAT", budgets)

    res.status(200).json(budgets);

  } catch (err) {
    res.status(500).json(err);
  }
});



// Create a budget
router.post('/', withAuth, async (req, res) => {

  try {
    //check if goal for this category exists.  Create new if it doesn't exist
    const budgetData = await Budget.findAll({
      where: { user_id: req.session.user_id },
      attributes: ['category_id']
    });

    const budgets = budgetData.map((budget) => budget.get({ plain: true }));

    let exists = false;

    //return if you find an already existing goal
    for (let i = 0; i < budgets.length; i++) {
      if (parseInt(budgets[i].category_id) === parseInt(req.body.category)) {
        exists = true;
      }
    };

    if (exists) {
      res.status(404).json({ message: 'Budget goal for this category exists.  Please use Update action to change the amount.' });
      return;
    }

    //otherwise create new one
    const newBudget = await Budget.create({
      amount: req.body.amount,
      fund_remaining: req.body.fund_remaining,
      category_id: req.body.category,
      user_id: req.session.user_id
    });

    if (!newBudget) {
      res.status(404).json({ message: 'New budget goal creation failed' });
      return;
    }

    res.status(200).json(newBudget);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update a budget
router.put('/:id', withAuth, async (req, res) => {
  try {
    const budgetData = await Budget.update({ amount: req.body.amount }, {
      where: {
        category_id: req.params.id,
        user_id: req.session.user_id
      },
      individualHooks: true
    });
    if (!budgetData[0]) {
      res.status(404).json({ message: 'No budget with this category and user!' });
      return;
    }
    res.status(200).json(budgetData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a budget
router.delete('/:id', withAuth, async (req, res) => {
  console.log(req.params.id)
  try {

    const budgetData = await Budget.destroy({
      where: {
        category_id: req.params.id,
      }
    });

    if (!budgetData) {
      res.status(404).json({ message: 'No budget with this category and user!' });
      return;
    }
    res.status(200).json(budgetData);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
