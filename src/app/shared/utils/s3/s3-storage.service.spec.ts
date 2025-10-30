import { TestBed } from '@angular/core/testing';
import { S3StorageService } from './s3-storage.service';
import { s3Client } from './cognito-s3.client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { environment } from '../../../../environments/environment';

jest.mock('./cognito-s3.client', () => ({
  s3Client: { send: jest.fn() },
}));

describe('S3StorageService', () => {
  let service: S3StorageService;

  const mockSend = s3Client.send as jest.Mock;

  const FIXED_NOW = 1700000000000;

  beforeAll(() => {
    const hasBlob = typeof Blob !== 'undefined';
    if (hasBlob && !(Blob.prototype as any).arrayBuffer) {
      (Blob.prototype as any).arrayBuffer = function () {
        return new Promise<ArrayBuffer>((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as ArrayBuffer);
          fr.readAsArrayBuffer(this as Blob);
        });
      };
    }
    if (typeof File !== 'undefined' && !(File.prototype as any).arrayBuffer) {
      (File.prototype as any).arrayBuffer = (Blob.prototype as any).arrayBuffer;
    }
  });

  beforeEach(() => {
    environment.aws = {
      region: 'us-east-1',
      s3: {
        bucket: 'test-bucket',
        prefix: 'uploads',
        allowedTypes: ['image/png', 'image/jpeg'],
        maxSizeMB: 5,
        publicBaseUrl: '',
      } as any,
    } as any;

    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
    mockSend.mockReset();

    TestBed.configureTestingModule({
      providers: [S3StorageService],
    });
    service = TestBed.inject(S3StorageService);
  });

  afterEach(() => {
    (Date.now as jest.Mock).mockRestore?.();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if file type is not allowed', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    await expect(service.upload(file)).rejects.toThrow('Tipo no permitido');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should throw error if file exceeds max size', async () => {
    const bigFile: any = { name: 'big.png', type: 'image/png', size: 6 * 1024 * 1024 };
    await expect(service.upload(bigFile)).rejects.toThrow('El archivo supera');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should call s3Client.send on valid upload', async () => {
    mockSend.mockResolvedValue({});

    const file = new File(['123'], 'logo.png', { type: 'image/png' });
    await service.upload(file);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [cmd] = mockSend.mock.calls[0];
    expect(cmd).toBeInstanceOf(PutObjectCommand);
    expect(cmd.input.Bucket).toBe('test-bucket');
    expect(cmd.input.Key).toBe(`uploads/${FIXED_NOW}-logo.png`);
    expect(cmd.input.ContentType).toBe('image/png');
    expect(cmd.input.Body).toBeInstanceOf(Uint8Array);
  });

  it('builds default public URL with region when publicBaseUrl is empty', async () => {
    mockSend.mockResolvedValue({});

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const url = await service.upload(file);

    expect(url).toBe(
      `https://test-bucket.s3.us-east-1.amazonaws.com/uploads/${FIXED_NOW}-logo.png`,
    );
  });

  it('uses publicBaseUrl trimming trailing slashes', async () => {
    mockSend.mockResolvedValue({});
    environment.aws.s3.publicBaseUrl = 'https://cdn.example.com///';

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const url = await service.upload(file);

    expect(url).toBe(`https://cdn.example.com/uploads/${FIXED_NOW}-logo.png`);
  });

  it('ensurePrefix: "/" when the name not have', async () => {
    mockSend.mockResolvedValue({});
    environment.aws.s3.prefix = 'folder';

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    await service.upload(file);

    const [cmd] = mockSend.mock.calls[0];
    expect(cmd.input.Key).toBe(`folder/${FIXED_NOW}-logo.png`);
  });

  it('ensurePrefix: "/"', async () => {
    mockSend.mockResolvedValue({});
    environment.aws.s3.prefix = 'images/';

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    await service.upload(file);

    const [cmd] = mockSend.mock.calls[0];
    expect(cmd.input.Key).toBe(`images/${FIXED_NOW}-logo.png`);
  });

  it('Control name whitout simbols', async () => {
    mockSend.mockResolvedValue({});
    const weird = new File(['x'], 'mi logo@final (v1).png', { type: 'image/png' });

    await service.upload(weird);

    const [cmd] = mockSend.mock.calls[0];
    expect(cmd.input.Key).toBe(`uploads/${FIXED_NOW}-mi_logo_final_v1_.png`);
  });
});
