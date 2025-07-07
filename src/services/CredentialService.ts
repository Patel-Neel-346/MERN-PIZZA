import bcrypt from 'bcrypt';

export class CredentialService {
    async comparePassword(userPassword: string, hasedPassword: string) {
        return await bcrypt.compare(userPassword, hasedPassword);
    }
}
