const Router = require('koa-router');

const router = new Router();
const rootController = require('../controllers/root');
const userController = require('../controllers/users');
const paymentController = require('../controllers/payment');
const staticController = require('../controllers/static');
const trackController = require('../controllers/track');

router.get('/', rootController.root);
// ------------ user/users ---------------------------------
router.post('/sign-in', userController.postSignIn);
router.post('/restore-password-step-one', userController.postRestorePasswordStepOne);
router.post('/restore-password-step-two', userController.postRestorePasswordStepTwo);
router.get('/user/:id', userController.getUser);
router.patch('/user/:id', userController.patchUser);
router.delete('/user/:id', userController.deleteUser);
router.post('/user-new-ap', userController.postNewAppUser);
router.get('/users/new-app-users', userController.getNewAppUsers);
router.get('/get-payment-page/:id', paymentController.getPaymentPage);
router.post('/pay-monthly-subscription', paymentController.payMonthly);
router.post('/pay-three-month', paymentController.payThreeMonth);
router.post('/pay-six-month', paymentController.paySixMonth);
router.post('/pay-one-year', paymentController.payOneYear);
router.post('/payment-notification', paymentController.postPaymentNotification);
router.get('/agreement', staticController.getAgreementPage);
router.get('/account/:id', staticController.getAccountPage);
router.get('/history/:id', staticController.getHistoryPage); // -
router.get('/my-track/:id', staticController.getMyTrackPage); // -
router.get('/help/:id', staticController.getHelpPage);
router.get('/edit-profile-page/:id', staticController.getProfileEditPage);
router.get('/test', paymentController.getTest);
router.get('/success', staticController.getPaymentSuccessPage);
router.get('/error', staticController.getPaymentErrorPage);
router.get('/unsubscribe/:id', paymentController.getUnsubscribePage);
router.post('/unsubscribe-done', paymentController.postUnsubscribe);
router.get('/success-unsubscribe', staticController.getUnsubscribeSuccessPage);
router.get('/fail-unsubscribe', staticController.getUnsubscribeErrorPage);
router.get('/track-sent-success', staticController.getTrackSentSuccessPage);
router.post('/send-track/:userId/:date', trackController.sendTrackToUser);
// -------------

module.exports = router;
