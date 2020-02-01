import { Injectable } from "@angular/core";
import { Router, RouterEvent, RoutesRecognized, NavigationEnd, ActivatedRoute } from "@angular/router";
import { filter, pairwise } from "rxjs/operators";

@Injectable()
export class RoutingStateService {
  previousUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public loadRouting(): void {
    this.router.events
            .pipe(filter((e: any) => e instanceof RoutesRecognized),
                pairwise()
            ).subscribe((e: any) => {
                if(e[0].urlAfterRedirects.startsWith('/login')) {
                  this.previousUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
                } else {
                  this.previousUrl = e[0].urlAfterRedirects;
                }
            });
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }
}