import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsComponent } from 'app/modules/admin/apps/settings/settings.component';
import { SettingsInformationComponent } from 'app/modules/admin/apps/settings/information/information.component';
import { SettingsSecurityComponent } from 'app/modules/admin/apps/settings/security/security.component';
import { SettingsPlanBillingComponent } from 'app/modules/admin/apps/settings/plan-billing/plan-billing.component';
import { SettingsNotificationsComponent } from 'app/modules/admin/apps/settings/notifications/notifications.component';
import { SettingsTeamComponent } from 'app/modules/admin/apps/settings/team/team.component';
import { settingsRoutes } from 'app/modules/admin/apps/settings/settings.routing';
import {SettingsKeysComponent} from "./keys/keys.component";

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsInformationComponent,
        SettingsSecurityComponent,
        SettingsPlanBillingComponent,
        SettingsNotificationsComponent,
        SettingsTeamComponent,
        SettingsKeysComponent
    ],
    imports     : [
        RouterModule.forChild(settingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        FuseAlertModule,
        SharedModule
    ]
})
export class SettingsModule
{
}
