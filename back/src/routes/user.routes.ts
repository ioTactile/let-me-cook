import { Request, Response, NextFunction, Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { AuthService } from "@/services/auth.service";

const router: Router = Router();

// Inscription
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.register(req.body, req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Connexion
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.login(req.body, req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Déconnexion
router.post(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthService.logout(req);
      res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
      next(error);
    }
  }
);

// Obtenir le profil de l'utilisateur connecté
router.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export const userRoutes = router;
