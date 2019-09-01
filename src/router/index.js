const Router = require('koa-router');

const router = new Router();
const rootController = require('../controllers/root');
const userController = require('../controllers/users');


router.get('/', rootController.root);
// ------------ user/users ---------------------------------
router.get('/user/:id', userController.getUser);
router.post('/user-new-ap', userController.postNewAppUser);
router.post('/user-new-cp', userController.postNewCPUser);
router.get('/users/new-app-users', userController.getNewAppUsers);
router.get('/users/new-cpp-users', userController.getNewCppUsers);
router.patch('/user', userController.patchUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/users', userController.getAll);
// -------------

module.exports = router;
