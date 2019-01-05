import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

// import { NgModule } from '@angular/core';
// import { SafePipe } from './safe/safe';
// @NgModule({
// 	declarations: [SafePipe],
// 	imports: [],
// 	exports: [SafePipe]
// })
// export class PipesModule {}
