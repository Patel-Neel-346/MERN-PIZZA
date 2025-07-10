import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenants';
import { ITenantData } from '../types';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private readonly tenanteRepository: Repository<Tenant>) {}

    async create(tenantData: ITenantData) {
        try {
            const tenant = await this.tenanteRepository.save(tenantData);

            return tenant;
        } catch (error) {
            const err = createHttpError(500, 'Faild to store data in Database');
            throw err;
        }
    }
}
