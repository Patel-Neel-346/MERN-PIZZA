import { DataSource } from 'typeorm';

export const truncateTables = async (Connection: DataSource) => {
    //get all entites
    const entites = Connection.entityMetadatas; // list of all entites

    //get specific entites by for each loop

    for (const entity of entites) {
        //get entity table name form all Entites
        const repository = Connection.getRepository(entity.name);
        //clear all
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
    // return true;
};
