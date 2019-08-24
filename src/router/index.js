const Router = require('koa-router');
const router = new Router();
const rootController = require('../controllers/root');
const userController = require('../controllers/users');


router.get('/', rootController.root);
// ------------ user/users ---------------------------------
router.get('/user/:id', userController.getUser);
router.post('/user', userController.postUser);
//router.patch('/user/:id', userController.patchUser);
//router.delete('/user/:id', userController.patchUser);
//router.get('/users', userController.getAll);
//------------- 

module.exports = router;
