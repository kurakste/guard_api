const Router = require('koa-router');

const router = new Router();
const rootController = require('../controllers/root');
const userController = require('../controllers/users');
const paymentController = require('../controllers/payment');
const staticController = require('../controllers/static');


router.get('/', rootController.root);
// ------------ user/users ---------------------------------
router.post('/sign-in', userController.postSignIn);
router.post('/restore-password-step-one', userController.postRestorePasswordStepOne);
router.post('/restore-password-step-two', userController.postRestorePasswordStepTwo);
router.get('/user/:id', userController.getUser);
router.post('/user-new-ap', userController.postNewAppUser);
router.get('/users/new-app-users', userController.getNewAppUsers);
router.get('/get-payment-page/:id', paymentController.getPaymentPage);
router.post('/pay-monthly-subscription', paymentController.payMonthlySubscriptionInit);
router.post('/pay-six-month', paymentController.paySixMonth);
router.post('/pay-one-year', paymentController.payOneYear);
router.post('/payment-notification', paymentController.postPaymentNotification);
router.get('/agreement', staticController.getAgreementPage);
router.get('/account/:id', staticController.getAccountPage);
router.get('/history/:id', staticController.getHistoryPage);
router.get('/help/:id', staticController.getHelpPage);
router.get('/test', paymentController.getTest);
// -------------

module.exports = router;
