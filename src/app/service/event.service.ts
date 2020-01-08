import {Injectable, EventEmitter} from '@angular/core';

@Injectable({providedIn:'root'})
export class EventService {
  emitter = new EventEmitter();
}