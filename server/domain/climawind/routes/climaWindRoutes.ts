import { Router } from 'express';
import { ClimaWindController } from '../controllers/climaWindController';

const router = Router();

router.get('/', ClimaWindController.getWindData);

export default router;
