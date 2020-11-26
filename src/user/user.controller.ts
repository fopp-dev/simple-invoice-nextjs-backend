import { Body, Controller, Get, HttpStatus, Param, Post, Put, Res, UseFilters, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MysqlExceptionFilter } from '../filters/mysql-exception.filter';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorators/roles.decorator';
import { ROLES } from '../constant';
import { RolesGuard } from '../guard/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {
  }

  @ApiTags('user')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load user by id',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('detail/:id')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async getUserDetail(@Param('id') id: number, @Res() res: any) {
    const response = await this.userService.getUserDetail(id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('user')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'update user by id and data',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('update/:id')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Res() res: any) {
    const response = await this.userService.updateUser(id, updateUserDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('user')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load all users',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('all')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async getAllUsers(@Res() res: any) {
    const response = await this.userService.getAllUsers();

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('user')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'mtaji global credit creates the partner and mtaji role user',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: any) {
    const response = await this.userService.createUser(createUserDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }
}
