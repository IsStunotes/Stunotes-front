import { NgModule } from '@angular/core';
import { LucideAngularModule, BookOpen, MessageSquare, Calendar, Trophy } from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      BookOpen,
      MessageSquare,
      Calendar,
      Trophy
    })
  ],
  exports: [
    LucideAngularModule
  ]
})
export class LucideIconsModule {}
