import { Test, TestingModule } from '@nestjs/testing';
import { PayItemService } from './pay-item.service';

describe('PayItemService', () => {
  let service: PayItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayItemService],
    }).compile();

    service = module.get<PayItemService>(PayItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
