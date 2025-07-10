import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTables1752128359168 implements MigrationInterface {
    name = 'RenameTables1752128359168';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
        );
        await queryRunner.renameTable('user', 'users');
        await queryRunner.renameTable('refreshToken', 'refreshTokens');

        await queryRunner.query(
            `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
        );
        await queryRunner.renameTable('users', 'user');
        await queryRunner.renameTable('refreshTokens', 'refreshToken');
    }
}
