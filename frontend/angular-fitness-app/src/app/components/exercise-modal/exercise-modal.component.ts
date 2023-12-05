import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject, last, takeUntil } from 'rxjs';
import { Exercise } from 'src/app/common/Exercise';
import { WorkingSet } from 'src/app/common/WorkingSet';
import { WorkoutService } from 'src/app/services/workout.service';

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
    private workoutService:WorkoutService,
    private router:Router) {}

  ngOnInit(): void {
    if (!!this.workoutId && !!this.exerciseId) {
    this.workoutService.getExercise(this.workoutId, this.exerciseId).subscribe(
      data => {
        this.exercise = data
        console.log(this.exercise.workingSet)
        if (this.exercise.workingSet) {
          this.addedSets = this.exercise.workingSet
        }
      })
    }
  
    this.exerciseFormGroup = this.formBuilder.group({
      sets: this.formBuilder.array([this.formBuilder.group({
        reps: new FormControl(),
        weight: new FormControl()})
      ])
    })
  }

  onSubmit() {
    const sets:WorkingSet[] = this.addedSets 
    console.log(sets)
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
    console.log(exerciseWrapperDto)
    this.workoutService.addOrUpdateExercise(this.workoutId!, exerciseWrapperDto).pipe(
      takeUntil(this.#unsubscribe$)
    ).subscribe(
      res => {
        console.log(res)
        const data = {message: res.message, status: res.status}
        if (res.status === 201) {
          this.activeModal.close(data)
        } else if (res.status === 200) {
          this.activeModal.close(data)
        }
      })
  }

  get sets(): FormArray {
    return this.exerciseFormGroup.get('sets') as FormArray;
  }

  addSet() {
    const setValues = this.sets.at(this.sets.length-1).value
    const newSet = {
      reps: +setValues.reps,
      weight: +setValues.weight
    }
    this.addedSets.push(newSet)
    this.sets.at(this.sets.length-1).reset()
    console.log(this.addedSets)
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


