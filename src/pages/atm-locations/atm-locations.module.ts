import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AtmLocationsPage } from './atm-locations';

@NgModule({
  declarations: [
    AtmLocationsPage,
  ],
  imports: [
    IonicPageModule.forChild(AtmLocationsPage),
  ],
})
export class AtmLocationsPageModule {}
