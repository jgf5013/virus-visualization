import { Component } from '@angular/core';

@Component({
	selector: 'information-panel',
	templateUrl: './information-panel.component.html',
	styleUrls: ['./information-panel.component.scss']
})
export class InformationPanelComponent {
	goToLinkedIn() {
		window.open('https://www.linkedin.com/in/jgf5013/', '_blank');
	}
}