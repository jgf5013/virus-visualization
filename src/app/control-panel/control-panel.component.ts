import { Component, ViewChild, ElementRef } from '@angular/core';
import { ControlPanelState } from './control-panel.interface';
import { Store } from '@ngrx/store';

import { ChangeControls } from './control-panel.actions';
import { MatSelectChange } from '@angular/material/select';

import { QuarantineLevels, Quarantine } from '../quarantine-level.interface';

@Component({
	selector: 'control-panel',
	templateUrl: './control-panel.component.html',
	styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
	public quarantineModes: Quarantine[] = [];
	constructor(private store: Store<ControlPanelState>) {
		for (const key in QuarantineLevels) {
			if (QuarantineLevels.hasOwnProperty(key)) {
				const level: Quarantine = QuarantineLevels[key];
				this.quarantineModes.push(level);
			}
		}
	}
	
	quarantineModeChange(event$: MatSelectChange): void {
		this.store.dispatch(ChangeControls({
			quarantine: event$.value
		}));
	}

}
