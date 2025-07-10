import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenatsIdForginKey1752129796269 implements MigrationInterface {
    name = 'AddTenatsIdForginKey1752129796269';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tenatsId" integer`);
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_79742a76339545511fec2fd7f3b" FOREIGN KEY ("tenatsId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_79742a76339545511fec2fd7f3b"`,
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenatsId"`);
    }
}
