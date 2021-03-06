import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/files.entity';
import { Repository } from 'typeorm';
import { AdvertsService } from '../adverts/adverts.service';
import {
  ERROR_FILE_NOT_FOUND,
  ERROR_FILE_NOT_UPLOADED,
} from '../../error/error-message';

@Injectable()
/**
 * Service for the files
 * @author Alec Berney, Teo Ferrari, Quentin Forestier, Melvyn Herzig
 */
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private advertService: AdvertsService,
  ) {}

  /**
   * Update the image for an advert
   * @param advertId Id of the advert
   * @param file File informations
   */
  async updateImage(advertId: number, file: File): Promise<File> {
    try {
      const newFile = await this.filesRepository.create(file);
      await this.filesRepository.save(newFile);

      const advert = await this.advertService.findOneAdvertById(advertId);

      advert.imageId = newFile.id;

      await this.advertService.updateAdvert(
        this.advertService.ToAdvert(advert),
      );

      return newFile;
    } catch (e) {
      throw new HttpException(ERROR_FILE_NOT_UPLOADED, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get an file by id
   * @param id Id of the file
   */
  async getImage(id: number): Promise<File> {
    try {
      return await this.filesRepository.findOne(id);
    } catch (e) {
      throw new HttpException(ERROR_FILE_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
  }
}
