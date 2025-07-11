import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/TenantsService';
import { Logger } from 'winston';
import { RegisterTenantsrequest } from '../types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
// import { Logger } from 'typeorm';

export class TenantsController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}
    async create(
        req: RegisterTenantsrequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const error = createHttpError(400, 'Invaid req');
        }

        try {
            const { name, address } = req.body;

            const tenant = await this.tenantService.create({
                name,
                address,
            });

            this.logger.info('Tenant has been created ', {
                id: tenant.id,
            });

            console.log(tenant);

            res.status(201).json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async update(
        req: RegisterTenantsrequest,
        res: Response,
        next: NextFunction,
    ) {}

    async getAll(req: Request, res: Response, next: NextFunction) {}

    static async getOne(req: Request, res: Response, next: NextFunction) {}

    static async destroy(req: Request, res: Response, next: NextFunction) {}
}
