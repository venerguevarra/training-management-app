import { Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RoutingStateService } from '../app/service/routing-state.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    subscription: Subscription;

    constructor(
        private router: Router,
        private routingStateService: RoutingStateService
    ) { }

    ngOnInit() {
        this.routingStateService.loadRouting();
        this.subscription = this.router.events
                                       .pipe(filter(event => event instanceof NavigationEnd))
                                       .subscribe(() => window.scrollTo(0, 0));
    }


    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}