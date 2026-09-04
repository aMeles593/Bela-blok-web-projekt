import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryGames } from './history-games';

describe('HistoryGames', () => {
  let component: HistoryGames;
  let fixture: ComponentFixture<HistoryGames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryGames]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryGames);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
