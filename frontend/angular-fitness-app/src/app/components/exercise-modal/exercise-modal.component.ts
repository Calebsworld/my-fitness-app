import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { Exercise } from 'src/app/common/Exercise';
import { FormValidation } from 'src/app/common/FormValidation';
import { WorkingSet } from 'src/app/common/WorkingSet';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-exercise-modal',
  templateUrl: './exercise-modal.component.html',
  styleUrls: ['./exercise-modal.component.css']
})
export class ExerciseModalComponent {


  @Input() exercise?:Exercise
  @Input() workoutId?:number
  @Input() exerciseId?:number

  exerciseFormGroup!:FormGroup  
  addedSets: WorkingSet[] = []
  setsToAdd: WorkingSet[] = []
  deletedIds:number[] = []
  #unsubscribe$ = new Subject<void>()
  
  constructor(private formBuilder:FormBuilder,
    public activeModal: NgbActiveModal,
    private userService:UserService,
    private router:Router) {}

  ngOnInit(): void {
    if (!!this.workoutId && !!this.exerciseId) {
    this.userService.getExercise(this.workoutId, this.exerciseId).subscribe({
      next: (exercise) => {
        this.exercise = exercise
        if (this.exercise.workingSet) {
          this.addedSets = this.exercise.workingSet
        }
      }, 
      error: (error) => {
        console.log(error)
      } 
    })
  }

  this.exerciseFormGroup = this.formBuilder.group({
    sets: this.formBuilder.array([
      this.formBuilder.group({
        reps: new FormControl('', [
          Validators.required,
          Validators.min(1),
          Validators.max(100),
        ]),
        weight: new FormControl('', [
          Validators.required,
          Validators.min(0),
          Validators.max(1000),
        ]),
      }),
    ]),
  });
  
  }

  onSubmit() {
    const sets:WorkingSet[] = this.addedSets 
    const exerciseWrapperDto:ExerciseWrapperDto = { 
      exerciseDto: {
        id: this.exerciseId, 
        name: this.exercise?.name,
        target: this.exercise?.target,
        bodypart: this.exercise?.bodyPart,
        equipment: this.exercise?.equipment,
        gifUrl: this.exercise?.gifUrl
      },
      workingSetDtos: sets,
      workingSetIds: this.deletedIds
    }
    // refactor
    this.userService.addOrUpdateExercise(this.workoutId!, exerciseWrapperDto).pipe(
      takeUntil(this.#unsubscribe$)
    ).subscribe({
      next: (exerciseResponse) => {
        const data = {message: exerciseResponse.message, status: exerciseResponse.status}
        if (exerciseResponse.status === 200 || 201) {
          this.activeModal.close(data)
        }
      }, 
      error: (error) => {
        console.log(error)
      }
    })
  }

  get sets(): FormArray {
    return this.exerciseFormGroup.get('sets') as FormArray;
  }

  addSet() {
    const currSet:WorkingSet = this.sets.at(this.sets.length-1).value
    const newSet:WorkingSet = {
      reps: +currSet.reps!,
      weight: +currSet.weight!
    }
    this.addedSets.push(newSet)
    this.sets.at(this.sets.length-1).reset()
  }

  isAddSetDisabled(index: number): boolean {
    const currSet = (this.exerciseFormGroup.get('sets') as FormArray).at(index)
    const repsControl = currSet.get('reps');
    const weightControl = currSet.get('weight');
    return !repsControl?.value || !weightControl?.value || 
    (repsControl?.pristine || weightControl?.pristine)
  }

  removeCurrentSet(set:WorkingSet) {
    
    const index = this.addedSets.findIndex(s => set.reps === s.reps && set.weight === s.weight)
    const removedItem = this.addedSets[index];
    if (removedItem && !!removedItem.id) {
        this.deletedIds.push(removedItem.id);
    }
    this.addedSets.splice(index, 1);
    console.log(this.addedSets)
  }

  copyCurrentSet(set:WorkingSet) {
    const newSet: WorkingSet = {
      reps: +set.reps!,
      weight: +set.weight!
    };
    this.addedSets.push(newSet)
    console.log(this.addedSets)
  }

  groupedSets(): {set: WorkingSet, count:number}[] {

    if (this.addedSets.length === 0) return [];
    
    let output:{set: WorkingSet, count:number}[] = []
    let currentItem:WorkingSet | null = null
    let currentCount = 0

    for (let set of this.addedSets) {
      if (currentItem === null || set.reps !== currentItem.reps || set.weight !== currentItem.weight) {
        if (currentItem !== null) {
          output.push({set: currentItem, count: currentCount})
        }
      currentItem = set
      currentCount = 1
      } else {
        currentCount++
      }
    }
    if (currentItem !== null) {
      output.push({set: currentItem, count: currentCount});
    }
    return output
  }

  handleCancel() {
    this.activeModal.dismiss('cancel');
    if (!!this.workoutId && !!this.exerciseId) {
      this.router.navigate(['/workout-details', this.workoutId])
    }
  }

  isRepsInvalid(index:number) {
    const currSet = (this.exerciseFormGroup.get('sets') as FormArray).at(index)
    const repsNameControl = currSet.get('reps')
    return (
      repsNameControl?.invalid &&
      (repsNameControl.dirty || repsNameControl.touched)
    );
  }

  isWeightInvalid(index:number) {
    const currSet = (this.exerciseFormGroup.get('sets') as FormArray).at(index)
    const repsNameControl = currSet.get('weight')
    return (
      repsNameControl?.invalid &&
      (repsNameControl.dirty || repsNameControl.touched)
    );
  }

  hasError(index:number, controlName: string, errorType: string): boolean {
    const currSet = (this.exerciseFormGroup.get('sets') as FormArray).at(index)
    const control = currSet.get(controlName);
    return !!control?.hasError(errorType);
  }
  

}

export interface ExerciseWrapperDto {
  exerciseDto: ExerciseDto,
  workingSetDtos: WorkingSet[],
  workingSetIds: number[]
}

export interface ExerciseDto {
  id?: number, 
  name?: string,
  target?: string,
  bodypart?: string,
  equipment?: string,
  gifUrl?: string
}


