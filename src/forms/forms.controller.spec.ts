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
          // When Nest asks for the FormsService, we give it our mock version.
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    controller = module.get<FormsController>(FormsController);
    service = module.get<FormsService>(FormsService); // Get a reference to the mock service
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the 'create' controller method
  describe('create', () => {
    it('should call the service to create a form and return the result', async () => {
      // ARRANGE: Set up our test data and mock return values
      const createFormDto: CreateFormDto = { user_uuid: 'uuid', procedure_type: 'type' };
      const mockFile: Express.Multer.File = {
          fieldname: 'image', originalname: 'Duck.jpg', encoding: '7bit', mimetype: 'image/jpeg',
          size: 12345, buffer: Buffer.from('test'), stream: new Readable(), destination: '', filename: '', path: ''
      };
      const expectedResult = { id: 1, ...createFormDto, image: 'path/to/image.jpg' };

      // Tell our mock service what to return when 'create' is called
      mockFormsService.create.mockResolvedValue(expectedResult);

      // ACT: Call the controller method we want to test
      const result = await controller.create(createFormDto, mockFile);

      // ASSERT: Check that everything happened as expected
      expect(result).toEqual(expectedResult); // Did the controller return the correct data?
      expect(service.create).toHaveBeenCalledWith(createFormDto, mockFile); // Did the controller call the service with the correct arguments?
    });
  });

  // Test suite for the 'findAll' controller method
  describe('findAll', () => {
    it('should call the service to find all forms and return the result', async () => {
      const expectedResult = [{ id: 1, procedure_type: 'Form 1', image: 'url' }];
      mockFormsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // Test suite for the 'findOne' controller method
  describe('findOne', () => {
    it('should call the service to find one form and return the result', async () => {
      const formId = '1';
      const expectedResult = { id: 1, procedure_type: 'Form 1', image: 'url' };
      mockFormsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(formId);

      expect(result).toEqual(expectedResult);
      // The controller receives a string param from the URL, but the service expects a number
      expect(service.findOne).toHaveBeenCalledWith(Number(formId));
    });
  });

  // Test suite for the 'update' controller method
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

  // Test suite for the 'remove' controller method
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
