import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/TenantsService';
import { Logger } from 'winston';
import { PaginationParams, RegisterTenantsrequest } from '../types';
import { matchedData, validationResult } from 'express-validator';
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
    ) {
        //validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            const error = createHttpError(400, 'Invalid request');
            next(error);
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid Url Params'));
            return;
        }

        this.logger.debug('request for updateing a tenant', req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('Tenant has been Updated', {
                id: tenantId,
            });

            res.status(200).json({
                id: Number(tenantId),
                message: 'Tenants Has been Updated SuccesFully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validQuery = matchedData(req, {
            onlyValidData: true,
        });

        this.logger.debug('Debugging the Query data :', validQuery);

        const [tenants, count] = await this.tenantService.getAll(
            validQuery as PaginationParams,
        );

        this.logger.info('All tenants have been fetched kkkk');

        res.json({
            data: tenants,
            currentPage: validQuery.currentPage as number,
            perPage: validQuery.perPage as number,
            total: count,
        });
    }

    async getTenantsDataById(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url Params'));
            return;
        }

        try {
            const tenant = await this.tenantService.getOne(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, 'Tenants does not exits'));
                return;
            }

            this.logger.info('Tenants has been fetched!');
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url Params'));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info('Tenants has been deleted from db', {
                id: Number(tenantId),
            });

            res.json({
                id: Number(tenantId),
            });
        } catch (error) {
            next(error);
        }
    }
}
