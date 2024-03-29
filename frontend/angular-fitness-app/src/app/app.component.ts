import {Component} from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { take } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-fitness-app';

  isAuth0Loading$ = this.authService.isLoading$

  constructor(private authService:AuthService
              ) {}

  ngOnInit() {
 
  }

}