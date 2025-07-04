import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async createUser({ firstName, lastName, email, password, role }: UserData) {
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
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in database',
            );
            throw error;
        }
    }
}
