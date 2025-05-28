import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { FormsModule } from '@angular/forms';

@NgModule({
     declarations: [AppComponent, MapComponent ],
      imports: [BrowserModule,FormsModule],
       providers: [],
        bootstrap: [AppComponent] 
})
export class AppModule {}