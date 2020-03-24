import { Component, ViewChild, ElementRef } from '@angular/core';
import { ControlPanelState } from './control-panel.interface';
import { Store } from '@ngrx/store';

import { ChangeControls } from './control-panel.actions';
import { MatSelectChange } from '@angular/material/select';

@Component({
	selector: 'control-panel',
	templateUrl: './control-panel.component.html',
	styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
	public quarentineModes: any[] = [{mode: 'low'}, {mode: 'medium'}, {mode: 'high'}, {mode: 'lockdown'}];
	constructor(private store: Store<ControlPanelState>) {}
	
	quarentineModeChange(event$: MatSelectChange): void {
		this.store.dispatch(ChangeControls({
			quarentineMode: event$.value
		}));
	}

}
