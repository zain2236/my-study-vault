export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address';
  }

  return null;
}

export function validatePasswordLength(password: string, minLength = 8): string | null {
  const value = password.trim();
  if (!value) {
    return 'Password is required';
  }

  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  return null;
}

