import {validateSchema, validateUpdateUser, validateLogin, validateAuth} from '../middlewares/middlewares.js'
import {Router} from 'express';
import usersController from '../controllers/users.js';
import auth from '../auth.js'


const router = Router();


router.get('/', validateAuth,  usersController.getUsers);

router.get('/:id', validateAuth, usersController.getUser);

router.patch('/:id',validateAuth, validateUpdateUser, usersController.setUser);
    
router.post('/signup', usersController.addUser);

router.post('/login', validateLogin, usersController.loginUser);

router.post('/logout', usersController.logoutUser);

export default router