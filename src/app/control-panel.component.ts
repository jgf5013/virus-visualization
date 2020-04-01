import { Component, ViewChild, ElementRef } from '@angular/core';
import { ControlPanelState } from './control-panel.interface';
import { Store } from '@ngrx/store';

import { ChangeControls } from './control-panel.actions';
import { MatSelectChange } from '@angular/material/select';

import { QuarantineLevels, Quarantine } from './quarentin-level.interface';

@Component({
	selector: 'control-panel',
	templateUrl: './control-panel.component.html',
	styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
	public quarentineModes: Quarantine[] = [];
	constructor(private store: Store<ControlPanelState>) {
		for (const key in QuarantineLevels) {
			if (QuarantineLevels.hasOwnProperty(key)) {
				const level: Quarantine = QuarantineLevels[key];
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
