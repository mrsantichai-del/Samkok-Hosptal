import { Test, TestingModule } from '@nestjs/testing';
import { PayItemController } from './pay-item.controller';

describe('PayItemController', () => {
  let controller: PayItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayItemController],
    }).compile();

    controller = module.get<PayItemController>(PayItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
