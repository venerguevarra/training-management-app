import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { User } from '../model/user';

@Injectable()
export class StateService {

     constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

     public setCurrentUser(user: User): void {
          this.storage.set('CURRENT_USER', JSON.stringify(user));
     }

     public getCurrentUser(): User {
          return JSON.parse(this.storage.get('CURRENT_USER'));
     }
}