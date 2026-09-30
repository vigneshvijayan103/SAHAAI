export interface UserProfileDto {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
}

export interface UpdateUserProfileDto {
  fullName: string;
  phoneNumber: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

