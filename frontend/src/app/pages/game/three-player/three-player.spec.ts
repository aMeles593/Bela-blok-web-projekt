import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreePlayer } from './three-player';

describe('ThreePlayer', () => {
  let component: ThreePlayer;
  let fixture: ComponentFixture<ThreePlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreePlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreePlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
