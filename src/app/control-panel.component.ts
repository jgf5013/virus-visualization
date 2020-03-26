import { Component, ViewChild, ElementRef } from '@angular/core';
import { ControlPanelState } from './control-panel.interface';
import { Store } from '@ngrx/store';

import { ChangeControls } from './control-panel.actions';
import { MatSelectChange } from '@angular/material/select';

import { QuarentineLevels, Quarentine } from './quarentin-level.interface';

@Component({
	selector: 'control-panel',
	templateUrl: './control-panel.component.html',
	styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
	public quarentineModes: Quarentine[] = [];
	constructor(private store: Store<ControlPanelState>) {
		for (const key in QuarentineLevels) {
			if (QuarentineLevels.hasOwnProperty(key)) {
				const level: Quarentine = QuarentineLevels[key];
				this.quarentineModes.push(level);
			}
		}
	}
	
	quarentineModeChange(event$: MatSelectChange): void {
		this.store.dispatch(ChangeControls({
			quarentine: event$.value
		}));
	}

}
