import bcrypt from 'bcryptjs';

export class CredentialService {
    async comparePassword(userPassword: string, hasedPassword: string) {
        return await bcrypt.compare(userPassword, hasedPassword);
    }
}
