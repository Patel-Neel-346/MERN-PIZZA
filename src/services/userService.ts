import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async createUser({ firstName, lastName, email, password }: UserData) {
        // const userRepository = AppDataSource.getRepository(User);
        await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });
    }
}
