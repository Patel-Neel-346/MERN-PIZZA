import { Brackets, Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { LimitedUserData, PaginationParams, UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async createUser({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        // const userRepository = AppDataSource.getRepository(User);
        // const user = await this.userRepository.findOneBy({ email: email });
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            const err = createHttpError(
                400,
                'User Already Exist in Our DataBase',
            );

            throw err;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role,
                tenats: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in database',
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
            relations:{
                tenats:true,
            }
        });
    }

    async findByid(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
            select: ['id', 'firstName', 'lastName', 'role', 'email'],
            relations:{
                tenats:true,
            }
        });
    }

    async update(
        userId: number,
        { firstName, lastName, role, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                tenats: tenantId ? { id: tenantId } : undefined,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw err;
        }
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }

    async getAll(validateQueryData: PaginationParams) {
        const queryBuilder = this.userRepository.createQueryBuilder('users');

        if (validateQueryData.q) {
            const searchItem = `%${validateQueryData.q}%`;

            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(users.firstName, ' ',users.lastName) ILIKE :q",
                        {
                            q: searchItem,
                        },
                    ).orWhere('users.email ILIKE :q', { q: searchItem });
                }),
            );
        }

        if (validateQueryData.role) {
            queryBuilder.andWhere('users.role = :role', {
                role: validateQueryData.role,
            });
        }

        const result = await queryBuilder
            .skip(
                (validateQueryData.currentPage - 1) * validateQueryData.perPage,
            )
            .take(validateQueryData.perPage)
            .orderBy('users.id', 'DESC')
            .leftJoinAndSelect('users.tenats', 'tenant')
            .getManyAndCount();

        return result;
    }
}
