const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const c       = require('../controllers/tripController');

router.post('/',                                        auth, c.createTrip);
router.get('/',                                         auth, c.getMyTrips);
router.get('/:tripId',                                  auth, c.getTripDetail);
router.patch('/:tripId',                                auth, c.updateTrip);
router.delete('/:tripId',                               auth, c.deleteTrip);

// Itinerary
router.post('/:tripId/days',                            auth, c.addDay);
router.post('/:tripId/days/:dayId/items',               auth, c.addItineraryItem);
router.delete('/:tripId/items/:itemId',                 auth, c.deleteItineraryItem);

// Budget
router.put('/:tripId/budget',                           auth, c.upsertBudget);
router.post('/:tripId/budget/items',                    auth, c.addBudgetItem);
router.delete('/:tripId/budget/items/:itemId',          auth, c.deleteBudgetItem);

// To-Do
router.post('/:tripId/todos',                           auth, c.addTodo);
router.patch('/:tripId/todos/:todoId',                  auth, c.toggleTodo);
router.delete('/:tripId/todos/:todoId',                 auth, c.deleteTodo);
router.get('/todo-templates',                           auth, c.getTodoTemplates);
router.post('/:tripId/todos/apply-template',            auth, c.applyTodoTemplate);

router.post('/:tripId/todos/share', auth, c.shareTodoList);


// Routes
router.post('/:tripId/routes',                          auth, c.addRoute);
router.delete('/:tripId/routes/:routeId',               auth, c.deleteRoute);

router.patch('/:tripId/hotel',                          auth, c.setTripHotel);


module.exports = router;
