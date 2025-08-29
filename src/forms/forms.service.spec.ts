import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Readable } from 'stream';

// Define the mock structure. This will be reset before each test.
jest.mock('../supabase/supabase.client', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

describe('FormsService', () => {
  let service: FormsService;
  const supabaseMock = supabase as jest.Mocked<typeof supabase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormsService],
    }).compile();

    service = module.get<FormsService>(FormsService);

    jest.resetAllMocks();

    /* Reset behaviour before each state to have a clean slate */
    (supabaseMock.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn(),
      }),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });
    (supabaseMock.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createFormDto: CreateFormDto = { user_uuid: 'uuid', procedure_type: 'type' };
    const mockFile: Express.Multer.File = {
        fieldname: 'image', originalname: 'Duck.jpg', encoding: '7bit', mimetype: 'image/jpeg',
        size: 12345, buffer: Buffer.from('test'), stream: new Readable(), destination: '', filename: '', path: ''
    };

    it('should create a form with an image successfully', async () => {
      const initialForm = { id: 1, ...createFormDto, image: null };
      const finalForm = { ...initialForm, image: `uuid/1-Duck.jpg` };

      // Mock the specific return values for this test's chain
      (supabaseMock.from('forms').insert(createFormDto).select().single as jest.Mock).mockResolvedValueOnce({ data: initialForm, error: null });
      (supabaseMock.storage.from('forms_images').upload as jest.Mock).mockResolvedValue({ error: null });
      (supabaseMock.from('forms').update({ image: finalForm.image }).eq('id', 1).select().single as jest.Mock).mockResolvedValueOnce({ data: finalForm, error: null });

      await service.create(createFormDto, mockFile);
      expect(supabaseMock.storage.from('forms_images').upload).toHaveBeenCalledWith(finalForm.image, mockFile.buffer, expect.any(Object));
    });
  });

/* findAll test suite */
  describe('findAll', () => {
    it('should fetch forms, generate signed URLs for images, and return the updated list', async () => {
      /* setup mock data */
      const originalImagePath = 'path/to/image1.jpg';
      const mockFormsFromDb = [
        { id: 1, procedure_type: 'Form 1', image: originalImagePath },
        { id: 2, procedure_type: 'Form 2', image: null },
      ];
      const newSignedUrl = 'http://signed.url/image1.jpg';

      /* mock what the database and storage will return */
      (supabaseMock.from('forms').select as jest.Mock).mockResolvedValue({ data: mockFormsFromDb, error: null });
      (supabaseMock.storage.from('forms_images').createSignedUrl as jest.Mock).mockResolvedValue({ data: { signedUrl: newSignedUrl }, error: null });

      /* run */
      const result = await service.findAll();

      /* test for forms WITH and WITHOUT image */
      expect(supabaseMock.storage.from('forms_images').createSignedUrl).toHaveBeenCalledTimes(1);
      expect(supabaseMock.storage.from('forms_images').createSignedUrl).toHaveBeenCalledWith(originalImagePath, 3600);

      /* check result array */
      expect(result).toBeDefined();
      expect(result.length).toBe(2);

      /* check form WITH and WITHOUT image */
      expect(result[0].image).toBe(newSignedUrl);
      expect(result[1].image).toBeNull();
    });
  });

  describe('update', () => {
    const updateFormDto: UpdateFormDto = { procedure_type: 'Updated Type' };
    const mockFile: Express.Multer.File = {
        fieldname: 'image', originalname: 'new-duck.jpg', encoding: '7bit', mimetype: 'image/jpeg',
        size: 54321, buffer: Buffer.from('new-image'), stream: new Readable(), destination: '', filename: '', path: ''
    };

    it('should update a form and replace the image', async () => {
      const existingForm = { id: 1, image: 'user-uuid/1-old.jpg', user_uuid: 'user-uuid' };
      const newImagePath = `user-uuid/1-new-duck.jpg`;
      const updatedForm = { ...existingForm, ...updateFormDto, image: newImagePath };
      
      (supabaseMock.from('forms').select('id, image, user_uuid').eq('id', 1).single as jest.Mock).mockResolvedValueOnce({ data: existingForm, error: null });
      (supabaseMock.storage.from('forms_images').remove as jest.Mock).mockResolvedValue({ error: null });
      (supabaseMock.storage.from('forms_images').upload as jest.Mock).mockResolvedValue({ error: null });
      (supabaseMock.from('forms').update(expect.any(Object)).eq('id', 1).select().single as jest.Mock).mockResolvedValueOnce({ data: updatedForm, error: null });

      const result = await service.update(1, updateFormDto, mockFile);

      expect(result.image).toBe(newImagePath);
      expect(supabaseMock.storage.from('forms_images').remove).toHaveBeenCalledWith([existingForm.image]);
    });
  });

  describe('remove', () => {
    it('should remove a form and its associated image', async () => {
      const formToDelete = { image: 'path/to/image.jpg' };
      
      (supabaseMock.from('forms').select('image').eq('id', 1).single as jest.Mock).mockResolvedValue({ data: formToDelete, error: null });
      (supabaseMock.storage.from('forms_images').remove as jest.Mock).mockResolvedValue({ error: null });
      (supabaseMock.from('forms').delete().eq as unknown as jest.Mock).mockResolvedValue({ error: null });

      await service.remove(1);

      expect(supabaseMock.storage.from('forms_images').remove).toHaveBeenCalledWith([formToDelete.image]);
      expect(supabaseMock.from('forms').delete().eq).toHaveBeenCalledWith('id', 1);
    });
  });
});
