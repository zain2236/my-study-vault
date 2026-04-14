import type { Route } from './+types/reset-password';
import type { MetaFunction } from 'react-router';
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import { useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';

import prisma from '~/server/prisma.server';
import { hashToken } from '~/server/crypto/token.server';
import { hashPassword } from '~/server/password/password.server';
import { validatePasswordLength } from '~/server/validation/auth-validation.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Reset Password - Study Vault' },
    {
      name: 'description',
      content: 'Create a new password for your Study Vault account. Enter your new password to regain access to your resources.',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/reset-password' },
    { property: 'og:title', content: 'Reset Password - Study Vault' },
    {
      property: 'og:description',
      content: 'Create a new password for your Study Vault account.',
    },
    { property: 'og:site_name', content: 'Study Vault' },

    // Twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Reset Password - Study Vault' },
    {
      name: 'twitter:description',
      content: 'Create a new password for your Study Vault account.',
    },
    { name: 'twitter:site', content: '@studyvault' },

    // Additional SEO
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'theme-color', content: '#d97757' },
  ];
};

type LoaderData = {
  valid: boolean;
  token?: string;
};

type ActionData = {
  error?: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get('token');

  if (!rawToken) {
    return { valid: false } satisfies LoaderData;
  }

  const hashedToken = hashToken(rawToken);
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
    return { valid: false } satisfies LoaderData;
  }

  return { valid: true, token: rawToken } satisfies LoaderData;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const rawToken = form.get('token');
  const rawPassword = form.get('password');
  const rawConfirm = form.get('confirmPassword');

  const token = typeof rawToken === 'string' ? rawToken : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';
  const confirmPassword = typeof rawConfirm === 'string' ? rawConfirm : '';

  try {
    if (!token) {
      return { error: 'Invalid reset link.' } satisfies ActionData;
    }

    // Validate passwords
    const passwordError = validatePasswordLength(password);
    if (passwordError) {
      return { error: passwordError } satisfies ActionData;
    }

    if (password !== confirmPassword) {
      return { error: 'Passwords do not match.' } satisfies ActionData;
    }

    // Re-validate the token (race condition protection)
    const hashedToken = hashToken(token);
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
      return { error: 'This reset link has expired or already been used. Please request a new one.' } satisfies ActionData;
    }

    // Hash the new password and update
    const newHashedPassword = await hashPassword(password);

    await prisma.$transaction([
      // Update user's password
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: newHashedPassword },
      }),
      // Mark this token as used
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      }),
      // Invalidate all other tokens for this user
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: tokenRecord.userId,
          id: { not: tokenRecord.id },
        },
      }),
    ]);

    return redirect('/login?reset=success');
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Something went wrong. Please try again.' } satisfies ActionData;
  }
}

export default function ResetPasswordPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Invalid / expired token state
  if (!loaderData.valid) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img src="/assests/fav-icon.png" alt="StudyVault logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invalid or Expired Link</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This password reset link is invalid, expired, or has already been used.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-[#d97757] hover:text-[#c66847] transition-colors"
        >
          <span>Request a new link</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Logo & Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img src="/assests/fav-icon.png" alt="StudyVault logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#d97757] mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-xs">
          Choose a new password for your account
        </p>
      </div>

      <Form method="post" className="space-y-5">
        {/* Hidden token field */}
        <input type="hidden" name="token" value={loaderData.token} />

        {/* Error Message */}
        {actionData?.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{actionData.error}</p>
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-[#d97757]">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className="block w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-[#d97757] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#d97757]">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              required
              minLength={8}
              autoComplete="new-password"
              className="block w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-[#d97757] transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 bg-[#d97757] text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-[#c66847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Reset Password</span>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[#d97757] dark:hover:text-[#d97757] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </Form>
    </div>
  );
}
