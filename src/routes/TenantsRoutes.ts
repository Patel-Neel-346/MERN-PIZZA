import express, { Request, Response, NextFunction } from 'express';
import { TenantsController } from '../controllers/TenantsController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenants';
import { TenantService } from '../services/TenantsService';
import logger from '../config/logger';
import { RegisterTenantsrequest } from '../types';
import TenantsValidator from '../validators/Tenants-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantsController = new TenantsController(tenantService, logger);

router.post(
    '/',
    TenantsValidator,
    (req: RegisterTenantsrequest, res: Response, next: NextFunction) =>
        tenantsController.create(req, res, next),
);

export default router;
