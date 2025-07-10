import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1752125009041 implements MigrationInterface {
    name = 'Migration1752125009041';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "refreshToken" ("id" SERIAL NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_be91607b0697b092c2bdff83b45" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "refreshToken" ADD CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
        );
        await queryRunner.query(`DROP TABLE "refreshToken"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
