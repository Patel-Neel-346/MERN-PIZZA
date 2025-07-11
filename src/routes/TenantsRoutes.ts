import express, { Request, Response, NextFunction } from 'express';
import { TenantsController } from '../controllers/TenantsController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenants';
import { TenantService } from '../services/TenantsService';
import logger from '../config/logger';
import { RegisterTenantsrequest } from '../types';
import TenantsValidator from '../validators/Tenants-validator';
import authenticate from '../middleware/authenticate';
import { CanAccess } from '../middleware/CanAccess';
import { Roles } from '../constants';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantsController = new TenantsController(tenantService, logger);

//Create Tenants
router.post(
    '/',
    authenticate,
    CanAccess([Roles.ADMIN]),
    TenantsValidator,
    (req: RegisterTenantsrequest, res: Response, next: NextFunction) =>
        tenantsController.create(req, res, next),
);

// update Tenants by Id
router.patch(
    '/:id',
    authenticate,
    CanAccess([Roles.ADMIN]),
    TenantsValidator,
    (req: RegisterTenantsrequest, res: Response, next: NextFunction) =>
        tenantsController.update(req, res, next),
);

// get all tenants

router.get('/', (req: Request, res: Response, next: NextFunction) =>
    tenantsController.getAll(req, res, next),
);

//get tenants by Id

router.get(
    '/:id',
    authenticate,
    CanAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantsController.getTenantsDataById(req, res, next),
);

//delete tenants

router.delete(
    '/:id',
    authenticate,
    CanAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantsController.destroy(req, res, next),
);

export default router;
