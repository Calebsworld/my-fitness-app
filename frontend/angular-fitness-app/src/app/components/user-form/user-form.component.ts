import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth0User, UserService } from 'src/app/services/user.service';
import { FormValidation } from 'src/app/common/FormValidation';
import { User } from 'src/app/common/User';
import { Subscription, map } from 'rxjs';
import { UserDto } from 'src/app/common/UserDto';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit, OnDestroy {
  userFormGroup!: FormGroup;
  subscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userFormGroup = this.formBuilder.group({
      fName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        FormValidation.notOnlyWhitespace,
      ]),
      lName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        FormValidation.notOnlyWhitespace,
      ]),
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addUser() {
    const { fName, lName } = this.userFormGroup.value;
    const auth0User: Auth0User | undefined = this.userService.getAuth0User();
    const userDto: UserDto = {
      firstName: fName,
      lastName: lName,
      email: auth0User?.email,
      avatar: auth0User?.avatar,
    };

    this.subscription = this.userService.addUser(userDto).subscribe({
      next: (userResponse) => {
        if (userResponse.status === 201) {
          const img = this.userService.getAuth0User()?.avatar || '';
          const user: User = {
            id: userResponse.user.id,
            firstName: userResponse.user.firstName,
            lastName: userResponse.user.lastName,
            email: userResponse.user.email,
            imgUrl: img,
          };
          this.userService.setUser(user);
          this.router.navigate(['exercise']);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  submitForm() {
    if (this.userFormGroup.invalid) {
      this.userFormGroup.markAllAsTouched();
      return;
    }
    this.addUser();
  }

  isFirstNameValid() {
    const userLastNameControl = this.userFormGroup.get('fName');
    return (
      userLastNameControl?.invalid &&
      (userLastNameControl.dirty || userLastNameControl.touched)
    );
  }

  isLastNameValid() {
    const userFirstNameControl = this.userFormGroup.get('lName');
    return (
      userFirstNameControl?.invalid &&
      (userFirstNameControl.dirty || userFirstNameControl.touched)
    );
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.userFormGroup?.get(controlName);
    return !!control?.hasError(errorType);
  }
}
