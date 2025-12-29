import { Component, ErrorHandler } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  errorMsg: string | null = null;

  constructor() { }

  ngOnInit() {
    window.onerror = (msg: any) => {
      this.errorMsg = msg.toString();
    };
  }
}
