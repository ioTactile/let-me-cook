import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { userController } from '@/controllers/user.controller';

const router: Router = Router();

// Inscription
router.post('/register', userController.register);

// Connexion
router.post('/login', userController.login);

// Déconnexion
router.post('/logout', authMiddleware, userController.logout);

// Obtenir le profil de l'utilisateur connecté
router.get('/me', authMiddleware, userController.getCurrentUser);

export const userRoutes = router;
