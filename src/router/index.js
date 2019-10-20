const Router = require('koa-router');

const router = new Router();
const rootController = require('../controllers/root');
const userController = require('../controllers/users');
const billController = require('../controllers/bills');
const paymentController = require('../controllers/payment');


router.get('/', rootController.root);
// ------------ user/users ---------------------------------
router.post('/sign-in', userController.postSignIn);
router.post('/replenishment', billController.replenishment);
router.post('/billing', billController.billing);
router.post('/restore-password-step-one', userController.postRestorePasswordStepOne);
router.post('/restore-password-step-two', userController.postRestorePasswordStepTwo);
router.get('/user/:id', userController.getUser);
router.post('/user-new-ap', userController.postNewAppUser);
router.get('/users/new-app-users', userController.getNewAppUsers);
router.post('/pay-monthly-subscription', paymentController.payMonthlySubscriptionInit);
router.get('/get-payment-page', paymentController.getPaymentPage);
router.post('/payment-notification', paymentController.postPaymentNotification);
// -------------

module.exports = router;
