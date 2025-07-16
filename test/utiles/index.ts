import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenants';

export const truncateTables = async (Connection: DataSource) => {
    const entites = Connection.entityMetadatas;

    for (const entity of entites) {
        const repository = Connection.getRepository(entity.name);

        await repository.clear();
    }
};

export const isJWT = (token: string | null): boolean => {
    if (!token) {
        return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
        return true;
    } catch (error) {
        return false;
    }
};

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'Test tenant',
        address: 'Test address',
    });
    return tenant;
};
