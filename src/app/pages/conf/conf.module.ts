import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RolesViewComponent } from './roles/roles-view/roles-view.component';

// Import Angular plugin.
// paginacion
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({ declarations: [
        RolesViewComponent,
    ],
    exports: [
        RolesViewComponent,
        // PaymentmethodEditComponent
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        PipesModule,
        BrowserAnimationsModule,
        NgxPaginationModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class ConfModule { }
