import { Test, TestingModule } from '@nestjs/testing';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Readable } from 'stream';

/* Mock service */
const mockFormsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('FormsController', () => {
  let controller: FormsController;
  let service: FormsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        {
          /* when Nest asks for the FormsService, we give it our mock version. */
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    controller = module.get<FormsController>(FormsController);
    service = module.get<FormsService>(FormsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service to create a form and return the result', async () => {
      const createFormDto: CreateFormDto = { user_uuid: 'uuid', procedure_type: 'type' };
      const mockFile: Express.Multer.File = {
          fieldname: 'image', originalname: 'Duck.jpg', encoding: '7bit', mimetype: 'image/jpeg',
          size: 12345, buffer: Buffer.from('test'), stream: new Readable(), destination: '', filename: '', path: ''
      };
      const expectedResult = { id: 1, ...createFormDto, image: 'path/to/image.jpg' };

      mockFormsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createFormDto, mockFile);

      expect(result).toEqual(expectedResult); 
      expect(service.create).toHaveBeenCalledWith(createFormDto, mockFile); 
    });
  });

  describe('findAll', () => {
    it('should call the service to find all forms and return the result', async () => {
      const expectedResult = [{ id: 1, procedure_type: 'Form 1', image: 'url' }];
      mockFormsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call the service to find one form and return the result', async () => {
      const formId = '1';
      const expectedResult = { id: 1, procedure_type: 'Form 1', image: 'url' };
      mockFormsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(formId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(Number(formId));
    });
  });

  describe('update', () => {
    it('should call the service to update a form and return the result', async () => {
      const formId = '1';
      const updateFormDto: UpdateFormDto = { procedure_type: 'Updated Type' };
      const mockFile: Express.Multer.File = {
          fieldname: 'image', originalname: 'new-duck.jpg', encoding: '7bit', mimetype: 'image/jpeg',
          size: 54321, buffer: Buffer.from('new-image'), stream: new Readable(), destination: '', filename: '', path: ''
      };
      const expectedResult = { id: 1, ...updateFormDto, image: 'new/path.jpg' };

      mockFormsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(formId, updateFormDto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(Number(formId), updateFormDto, mockFile);
    });
  });

  describe('remove', () => {
    it('should call the service to remove a form and return the result', async () => {
      const formId = '1';
      const expectedResult = { message: `Form 1 and associated image deleted successfully` };
      mockFormsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(formId);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(Number(formId));
    });
  });
});
