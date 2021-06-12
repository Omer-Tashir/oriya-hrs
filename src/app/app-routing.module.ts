import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { isAdminGuard, isCompanyGuard } from './auth/auth.guard';

import { HomeComponent } from './home/home.component';
import { CompaniesComponent } from './companies/companies.component';
import { ArticlesComponent } from './articles/articles.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { SalarySurveyComponent } from './salary-survey/salary-survey.component';
import { CompanySignUpComponent } from './company-sign-up/company-sign-up.component';
import { CompanyNewJobOfferComponent } from './company-new-job-offer/company-new-job-offer.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'companies', component: CompaniesComponent, canActivate: [isAdminGuard] },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'salary-survey', component: SalarySurveyComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'company-sign-up', component: CompanySignUpComponent },
  { path: 'company-new-job-offer', component: CompanyNewJobOfferComponent, canActivate: [isCompanyGuard] },
  { path: 'contact-us', component: ContactUsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private router: Router, private authService: AuthService) {
    this.router.errorHandler = (error: any) => {
      if (error === 'company') {
        this.authService.companyLogout();
      }
      else {
        this.authService.logout(error);
      }
    };
  }
}
