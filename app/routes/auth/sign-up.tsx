import type { Route } from './+types/sign-up';
import { useState } from 'react';
import { Form, Link, useNavigation, useActionData, redirect } from 'react-router';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

import prisma from '../../utils/prisma.server';
import { hashPassword } from '../../utils/password/password.server';
import { createLoginSession, getUserId } from '~/utils/cookie-session/session.server';
import { validateEmail, validatePasswordLength } from '~/utils/validation/auth-validation.server';

type ActionData = {
  error?: string;
};

// Check if user is already logged in ?
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/user/dashboard');
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawUsername = formData.get('username');
  const rawEmail = formData.get('email');
  const rawPassword = formData.get('password');

  const user_name = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!user_name) {
    return { error: 'Username is required' } satisfies ActionData;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { error: emailError } satisfies ActionData;
  }

  const passwordError = validatePasswordLength(password, 8);
  if (passwordError) {
    return { error: passwordError } satisfies ActionData;
  }

  try {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { error: 'An account with this email already exists' } satisfies ActionData;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: { user_name, email, password: hashedPassword },
    });

    if (!user) {
      return { error: 'Failed to create user' } satisfies ActionData;
    }

    // Create session for user 
    return await createLoginSession(user.id, '/user/dashboard');
  } catch (error) {
    return { error: 'Failed to create user. Please try again.' } satisfies ActionData;
  }
}

export default function SignUpPage() {
  const actionData = useActionData<ActionData>();
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form
      method="post"
      className="space-y-5">
      {/* Logo & Header inside card */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-2">
          <div className=" w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <img src="/assests/fav-icon.png" alt="StudyVault logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#d97757] mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-xs tracking-wide">
          Join our community and start sharing your study resources
        </p>
      </div>
      {/* Error Message */}
      {actionData?.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{actionData.error}</p>
        </div>
      )}

      {/* Username Input */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-semibold text-[#d97757]">
          Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            required
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
          />
        </div>

      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-[#d97757]">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@university.edu"
            required
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold text-[#d97757]">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            required
            minLength={8}
            className="block w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-[#d97757] transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start pt-2">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-[#d97757] focus:ring-[#d97757] border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded cursor-pointer"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
            I agree to the{' '}
            <Link to="/terms-of-service" className="font-semibold text-[#d97757] hover:text-[#c66647] transition-colors underline-offset-2 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="font-semibold text-[#d97757] hover:text-[#c66847] transition-colors underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>
      </div>

      {/* Sign Up Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center space-x-2 bg-[#d97757] text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-[#c66847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-[#d97757] mt-4"
      >
        <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
      </button>

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400">or</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <a
        href="/auth/google"
        className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] transition-all transform hover:scale-[1.02] shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Sign up with Google</span>
      </a>

      {/* Sign In Link */}
      <div className="text-center ">
        <p className="text-gray-400 dark:text-gray-400 text-sm ">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#d97757] hover:text-[#c66847] transition-colors underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Form>
  );
}