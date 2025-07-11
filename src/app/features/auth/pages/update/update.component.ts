import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service'; 
import { UserProfile } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import Swal from 'sweetalert2';
import { ChatComponent } from '../../../chat/chat.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavbarLoggedComponent,
    SidebarComponent,
    FooterComponent,
    ChatComponent
  ],
  template:`
  <app-navbar></app-navbar>

<div class="layout">
  <app-sidebar></app-sidebar>

  <main class="profile-section">
    <h1 class="profile-title">Mi Perfil</h1>
    <p class="profile-subtitle">Puedes actualizar tus datos personales cuando lo necesites.</p>

    <div *ngIf="isLoading" class="loading-state">Cargando perfil...</div>

    <form *ngIf="!isLoading" [formGroup]="profileForm" class="profile-form">
      <div class="form-row">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input id="name" formControlName="name" />
        </div>

        <div class="form-group">
          <label for="lastName">Apellido</label>
          <input id="lastName" formControlName="lastName" />
        </div>
      </div>

      <div class="form-group full-width">
        <label for="email">Correo electrónico</label>
        <input id="email" formControlName="email" [disabled]="true" />
      </div>

      <div class="form-actions">
        <button *ngIf="!isEditing" class="edit-btn" (click)="toggleEdit()">✏️ Editar</button>
        <button *ngIf="isEditing" class="save-btn" (click)="saveChanges()">💾 Guardar</button>
      </div>
    </form>
  </main>
</div>
<app-floating-chat></app-floating-chat>
<app-footer></app-footer>

  `,
  styleUrls: ['./update.component.css']
})
export class UserUpdateComponent implements OnInit {
  profileForm!: FormGroup;
  userData!: UserProfile;
  isEditing = false;
  isLoading = true;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;

    if (userId) {
      this.userService.getUserProfileById(userId).subscribe((profile) => {
        this.userData = profile;
        this.profileForm = this.fb.group({
          name: [{ value: profile.name, disabled: true }],
          lastName: [{ value: profile.lastName, disabled: true }],
          email: [{ value: profile.email, disabled: true }]
        });
        this.isLoading = false;
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.profileForm.get('name')?.enable();
    this.profileForm.get('lastName')?.enable();
  }

  saveChanges(): void {
    const updatedData = {
      name: this.profileForm.value.name,
      lastName: this.profileForm.value.lastName
    };
  
    this.userService.updateUserProfile(this.userData.id, updatedData).subscribe((updatedUser) => {
      this.userData = updatedUser;
      this.isEditing = false;
      this.profileForm.patchValue(updatedUser);
      this.profileForm.get('name')?.disable();
      this.profileForm.get('lastName')?.disable();
  
      const token = localStorage.getItem('token');
      const updatedUserToStore = { ...updatedUser, token };
      localStorage.setItem('user', JSON.stringify(updatedUserToStore));
  
      Swal.fire({
        icon: 'success',
        title: 'Cambios guardados',
        text: 'Tu perfil se ha actualizado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    });
  }
  
}
