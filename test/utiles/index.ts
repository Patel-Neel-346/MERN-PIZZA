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

var earliestAndLatest = function (n, firstPlayer, secondPlayer) {
    let l = Math.min(firstPlayer, secondPlayer);
    let r = Math.max(firstPlayer, secondPlayer);

    if (l + r === n + 1) return [1, 1];
    if (n === 3 || n === 4) return [2, 2];
    if (l - 1 > n - r) {
        let t = n + 1 - l;
        l = n + 1 - r;
        r = t;
    }

    let next = Math.floor((n + 1) / 2);
    let min = n;
    let max = 1;

    if (r * 2 <= n + 1) {
        let pl = l - 1;
        let mid = r - l - 1;
        for (let i = 0; i <= pl; i++) {
            for (let j = 0; j <= mid; j++) {
                let res = earliestAndLatest(next, i + 1, i + j + 2);
                min = Math.min(min, 1 + res[0]);
                max = Math.max(max, 1 + res[1]);
            }
        }
    } else {
        let mir = n + 1 - r;
        let pl = l - 1;
        let mid = mir - l - 1;
        let gap = r - mir - 1;
        for (let i = 0; i <= pl; i++) {
            for (let j = 0; j <= mid; j++) {
                let res = earliestAndLatest(
                    next,
                    i + 1,
                    i + j + 1 + Math.floor((gap + 1) / 2 + 1),
                );
                min = Math.min(min, 1 + res[0]);
                max = Math.max(max, 1 + res[1]);
            }
        }
    }

    return [min, max];
};
