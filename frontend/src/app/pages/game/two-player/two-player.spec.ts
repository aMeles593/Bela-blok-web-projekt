import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoPlayer } from './two-player';

describe('TwoPlayer', () => {
  let component: TwoPlayer;
  let fixture: ComponentFixture<TwoPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
