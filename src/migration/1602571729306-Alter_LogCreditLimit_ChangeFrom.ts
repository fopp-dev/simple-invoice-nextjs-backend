import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterLogCreditLimitChangeFrom1602571729306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE log_credit_limit MODIFY COLUMN changeFrom decimal(10, 2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE log_credit_limit MODIFY COLUMN changeFrom decimal(10, 2) NOT NULL`);
    }

}
