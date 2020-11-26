import { MysqlExceptionFilter } from './mysql-exception.filter';

describe('MysqlExceptionFilter', () => {
  it('should be defined', () => {
    expect(new MysqlExceptionFilter()).toBeDefined();
  });
});
