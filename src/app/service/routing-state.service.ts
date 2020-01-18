import { Injectable } from "@angular/core";
import { Router, RouterEvent, RoutesRecognized, NavigationEnd } from "@angular/router";
import { filter, pairwise } from "rxjs/operators";

@Injectable()
export class RoutingStateService {
  previousUrl;

  constructor(
    private router: Router
  ) {}

  public loadRouting(): void {
    this.router.events
            .pipe(filter((e: any) => e instanceof RoutesRecognized),
                pairwise()
            ).subscribe((e: any) => {
                this.previousUrl = e[0].urlAfterRedirects;
            });
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }
}