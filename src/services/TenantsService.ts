import { Brackets, Repository } from 'typeorm';
import { Tenant } from '../entity/Tenants';
import { ITenantData, PaginationParams } from '../types';
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

    async update(id: number, tenantData: ITenantData) {
        try {
            return await this.tenanteRepository.update(id, tenantData);
        } catch (error) {
            const err = createHttpError(500, 'Falid to store data in db');
            throw err;
        }
    }

    async getOne(tenantId: number) {
        try {
            return await this.tenanteRepository.findOne({
                where: { id: tenantId },
            });
        } catch (error) {
            const err = createHttpError(
                500,
                'failed to get tenants data from DB',
            );
            throw err;
        }
    }

    async deleteById(tenantId: number) {
        try {
            return await this.tenanteRepository.delete(tenantId);
        } catch (error) {
            const err = createHttpError(500, 'failed to delete tenant from Db');
            throw err;
        }
    }

    async getAll(
        validateQueryData: PaginationParams,
    ): Promise<[Tenant[], number]> {
        const queryBuilder =
            this.tenanteRepository.createQueryBuilder('tenant');

        if (validateQueryData.q) {
            const searchTerm = `%${validateQueryData.q}%`;

            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(tenant.name,' ',tenant.address) ILIKE :q",
                        {
                            q: searchTerm,
                        },
                    );
                }),
            );
        }

        const result = await queryBuilder
            .skip(
                (validateQueryData.currentPage - 1) * validateQueryData.perPage,
            )
            .take(validateQueryData.perPage)
            .orderBy('tenant.id', 'DESC')
            .getManyAndCount();

        return result;
    }
}
