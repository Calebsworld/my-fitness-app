import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from 'src/app/services/workout.service';
import { Workout } from 'src/app/common/Workout';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormValidation } from 'src/app/common/FormValidation';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-workout-form',
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.css'],
})
export class WorkoutFormComponent implements OnInit {
  workoutFormGroup!: FormGroup;
  workoutResponse$?: Observable<any>;
  workoutExistMessage?: String;

  workoutId?: number;
  workout$?: Observable<Workout>;
  routeUrl?: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.workoutId = +params.get('id')!;
      if (!this.workoutId) {
        this.initializeNewWorkoutForm();
        this.routeUrl = '/exercise';
      } else {
        this.loadExistingWorkoutForm(this.workoutId);
        this.routeUrl = '/workout';
      }
    });
  }

  initializeNewWorkoutForm() {
    this.workoutFormGroup = this.formBuilder.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        FormValidation.notOnlyWhitespace,
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        FormValidation.notOnlyWhitespace,
      ]),
    });
  }

  loadExistingWorkoutForm(workoutId: number) {
    this.userService.getWorkoutById(workoutId).subscribe((workout) => {
      console.log('Received workout:', workout);
      this.workoutFormGroup = this.formBuilder.group({
        name: new FormControl(workout.name, [
          Validators.required,
          Validators.minLength(2),
          FormValidation.notOnlyWhitespace,
        ]),
        description: new FormControl(workout.description, [
          Validators.required,
          Validators.minLength(5),
          FormValidation.notOnlyWhitespace,
        ]),
      });
    });
  }

  submitForm() {
    if (this.workoutFormGroup.invalid) {
      this.workoutFormGroup.markAllAsTouched();
      return;
    }
    if (this.workoutId) {
      this.updateWorkout();
    } else {
      this.addWorkout();
    }
  }

  addWorkout() {
    const { name, description } = this.workoutFormGroup.value;
    const workoutToAdd: Workout = { name, description };
    this.userService.addOrUpdateWorkout(workoutToAdd).subscribe({
        next: (workoutResponse) => {
          if (workoutResponse.status === 201) {
            this.router.navigate([`/exercise/workout/${workoutResponse.id}`], {
              queryParams: { workoutSuccessMessage: workoutResponse.message },
            });
          }
        },
        error: (error) => {
          console.log(error)
        }
      })
  }

  updateWorkout() {
    const { name, description } = this.workoutFormGroup.value;
    const workoutToSave: Workout = { id: this.workoutId, name, description };
    this.userService.addOrUpdateWorkout(workoutToSave).subscribe({
      next: (workoutResponse) => {
        if (workoutResponse.status === 201) {
          this.router.navigate(['/exercise'], {
            queryParams: {
              workoutId: workoutResponse.id,
              workoutSuccessMessage: workoutResponse.message,
            },
          });
        }
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  handleCancel() {
    this.router.navigate([this.routeUrl]);
  }

  isWorkoutNameInvalid() {
    const workoutNameControl = this.workoutFormGroup.get('name');
    return (
      workoutNameControl?.invalid &&
      (workoutNameControl.dirty || workoutNameControl.touched)
    );
  }

  isWorkoutDescriptionInvalid(): any {
    const workoutDescriptionControl = this.workoutFormGroup.get('description');
    return (
      workoutDescriptionControl?.invalid &&
      (workoutDescriptionControl.dirty || workoutDescriptionControl.touched)
    );
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.workoutFormGroup?.get(controlName);
    return !!control?.hasError(errorType);
  }
}

export interface WorkoutResponse {
  id: number;
  name: string;
  description: string;
  message: string;
  status: number;
}