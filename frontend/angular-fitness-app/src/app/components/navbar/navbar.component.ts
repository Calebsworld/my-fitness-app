import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { User } from 'src/app/common/User';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isAuthenticated$!: Observable<any>
  isUserSet$!: Observable<boolean>


  constructor( private authService: AuthService, @Inject(DOCUMENT) private doc: Document, private userService:UserService) {}
  
  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated$
    this.isUserSet$ = this.userService.isUserSet$
  }

  handleLogout(): void {
    this.authService.logout({
      logoutParams: {
        returnTo: this.doc.location.origin,
      },
    });
    this.userService.clearUser()
  }


  



}
