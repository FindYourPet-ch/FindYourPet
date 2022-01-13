import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdvertsService } from './adverts.service';
import { AuthGuard } from '@nestjs/passport';
import { FilterDto } from './dto/filters.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AdvertDto } from './dto/advert.dto';
import { ExtractJwt } from 'passport-jwt';
import { isJWT } from 'class-validator';
import { Advert } from './entities/adverts.entity';
import {
  Action,
  CaslAbilityFactory,
} from '../../security/casl/casl-ability.factory';
import { CreateAdvertDto } from './dto/create.adverts.dto';
import { UpdateAdvertDto } from './dto/update.adverts.dto';

/**
 * Advert controller
 */
@Controller('adverts')
export class AdvertsController {
  constructor(
    private advertService: AdvertsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /*******************  GET   ************************/

  @Get(':lang/page/:pageNum')
  async findPage(
    @Param('pageNum') pageNum: string,
    @Param('lang') lang: string,
    @Request() req,
  ): Promise<AdvertDto[]> {
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      return this.advertService.ToAdvertsDto(
        await this.advertService.findPageAdvert(parseInt(pageNum, 10)),
        lang,
        isJWT(jwt),
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':lang/id/:id')
  async findOneById(
    @Param('id') id: string,
    @Param('lang') lang: string,
    @Request() req,
  ): Promise<AdvertDto> {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return this.advertService.ToAdvertDto(
      await this.advertService.findOneAdvertById(parseInt(id)),
      lang,
      isJWT(jwt),
    );
  }

  @Get(':lang/members/:uuid')
  @UseGuards(AuthGuard('jwt'))
  async findAllByUuid(
    @Param('uuid') uuid: string,
    @Param('lang') lang: string,
  ): Promise<AdvertDto[]> {
    return this.advertService.ToAdvertsDto(
      await this.advertService.findAllAdvertByUuid(uuid),
      lang,
      true,
    );
  }

  @Get(':lang/recent')
  async findTopRecent(
    @Param('lang') lang: string,
    @Request() req,
  ): Promise<AdvertDto[]> {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return this.advertService.ToAdvertsDto(
      await this.advertService.findTop10RecentAdvert(),
      lang,
      isJWT(jwt),
    );
  }

  @Get(':lang/filters/page/:pageNum')
  async findAllByFilter(
    @Body() filterDto: FilterDto,
    @Param('pageNum') pageNum: string,
    @Param('lang') lang: string,
    @Request() req,
  ): Promise<AdvertDto[]> {
    try {
      await this.advertService.checkFilter(filterDto);
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      return this.advertService.ToAdvertsDto(
        await this.advertService.filterAdvert(filterDto, parseInt(pageNum, 10)),
        lang,
        isJWT(jwt),
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /*******************  POST  ************************/

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() advert: CreateAdvertDto,
    @Req() req,
  ): Promise<AdvertDto> {
    const ability = this.caslAbilityFactory.createForMember(req.user);
    advert.memberId = req.user.id;
    if (ability.can(Action.Create, Advert)) {
      return this.advertService.ToAdvertDto(
        await this.advertService.createAdvert(
          this.advertService.ToAdvert(advert),
        ),
        undefined,
        true,
      );
    }
    throw new UnauthorizedException();
  }

  /*******************  PUT   ************************/
  @Put()
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Body() updatedAdvert: UpdateAdvertDto,
    @Req() req,
  ): Promise<UpdateResult> {
    const ability = this.caslAbilityFactory.createForMember(req.user);
    const advert = await this.advertService.findOneAdvertById(updatedAdvert.id);
    if (ability.can(Action.Update, advert)) {
      updatedAdvert.memberId = advert.memberId;
      return await this.advertService.updateAdvert(
        this.advertService.ToAdvert(updatedAdvert),
      );
    }
    throw new UnauthorizedException();
  }

  /******************* DELETE ************************/
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteOne(@Param('id') id: number, @Req() req): Promise<DeleteResult> {
    console.log(req.user);
    const ability = this.caslAbilityFactory.createForMember(req.user);

    if (
      ability.can(Action.Delete, await this.advertService.findOneAdvertById(id))
    ) {
      return this.advertService.deleteAdvert(id);
    }
    throw new UnauthorizedException();
  }
}
