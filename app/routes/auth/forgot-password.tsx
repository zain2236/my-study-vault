import type { Route } from './+types/forgot-password';
import type { MetaFunction } from 'react-router';
import { Form, Link, useActionData, useNavigation } from 'react-router';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

import prisma from '../../utils/prisma.server';
import { validateEmail } from '~/utils/validation/auth-validation.server';
import { generateToken, hashToken } from '~/utils/crypto/token.server';
import { sendPasswordResetEmail } from '~/utils/email/email.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password - Study Vault' },
    {
      name: 'description',
      content: 'Reset your Study Vault password. Enter your email to receive a secure password reset link.',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://studyvault.com/forgot-password' },
    { property: 'og:title', content: 'Forgot Password - Study Vault' },
    {
      property: 'og:description',
      content: 'Reset your Study Vault password. Enter your email to receive a secure password reset link.',
    },
    { property: 'og:site_name', content: 'Study Vault' },

    // Twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Forgot Password - Study Vault' },
    {
      name: 'twitter:description',
      content: 'Reset your Study Vault password securely.',
    },
    { name: 'twitter:site', content: '@studyvault' },

    // Additional SEO
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'theme-color', content: '#d97757' },
  ];
};

type ActionData = {
  success?: boolean;
  error?: string;
};

//  Reset Token for each user 
const MAX_ACTIVE_TOKENS = 3;
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const rawEmail = form.get('email');
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  try {
    const emailError = validateEmail(email);
    if (emailError) {
      return { error: emailError } satisfies ActionData;
    }

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
    } satisfies ActionData;

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the email exists
    if (!user) {
      return successResponse;
    }

    // Skip for Google-only accounts (no password to reset)
    if (!user.password) {
      return successResponse;
    }

    // Rate limit: delete oldest tokens if user has too many
    const existingTokens = await prisma.passwordResetToken.findMany({
      where: { userId: user.id, used: false },
      orderBy: { createdAt: 'asc' },
    });

    if (existingTokens.length >= MAX_ACTIVE_TOKENS) {
      const tokensToDelete = existingTokens.slice(0, existingTokens.length - MAX_ACTIVE_TOKENS + 1);
      await prisma.passwordResetToken.deleteMany({
        where: { id: { in: tokensToDelete.map((t) => t.id) } },
      });
    }

    // Generate and store hashed token
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    // Build reset URL with the RAW token (DB stores the hash)
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return successResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return { error: 'Something went wrong. Please try again.' } satisfies ActionData;
  }
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

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
          Forgot Password
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-xs">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {actionData?.success ? (
        /* Success State */
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Check your email</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If an account exists with that email, we've sent a password reset link. Please check your inbox and spam folder.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[#d97757] hover:text-[#c66847] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      ) : (
        /* Form State */
        <Form method="post" className="space-y-5">
          {/* Error Message */}
          {actionData?.error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{actionData.error}</p>
            </div>
          )}

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
                autoComplete="email"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded-lg focus:ring-2 focus:ring-[#d97757] focus:border-[#d97757] transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-[#d97757] text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-[#c66847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97757] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Send Reset Link</span>
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
      )}
    </div>
  );
}
