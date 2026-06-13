---
title: "Authentication Setup"
---

# Authentication Setup

Trackion supports multiple authentication methods for self-hosted deployments. You can use the built-in email authentication system, enable Google Sign-In, GitHub Sign-In, or combine multiple providers together.

## Supported Providers

Currently Trackion supports:

- Email & Password
- Google OAuth
- GitHub OAuth

You can enable any combination of these providers.

## Configure Your URLs

Before configuring authentication, make sure your application URLs are correctly set.

```env
BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:1420"
```

For production deployments:

```env
BASE_URL="https://api.example.com"
FRONTEND_URL="https://analytics.example.com"
```

These URLs are used when generating authentication callbacks, verification links, and password reset links.

## Email Authentication

Email authentication works out of the box and is enabled by default.

Users can:

- Create accounts
- Sign in with email and password
- Reset passwords
- Verify email addresses

### Personal Deployments

If you're running Trackion for personal use, email configuration is completely optional.

When `RESEND_API_KEY` is not configured, Trackion automatically falls back to logging verification and password reset codes directly to the server logs.

This allows you to use authentication features without setting up an email provider.

### Resend (optional)

Trackion uses [Resend](https://resend.com/) to send authentication emails such as email verification and password reset codes.

To enable email delivery, configure your Resend API key:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

Before enabling Resend, create the following public email templates in your Resend account:

- `email-verification`
- `password-reset`

Both templates must:

- Be published
- Accept a `code` variable
- Be available to the API key being used

Once configured, Trackion will automatically send:

- Email verification codes
- Password reset codes

## Google OAuth

To allow users to sign in with Google, create an OAuth application in Google Cloud Console.

### Redirect URI

```text
http://localhost:8000/auth/callback/google
```

For production:

```text
https://api.example.com/auth/callback/google
```

### Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

Restart the server after updating your environment variables.

Once configured, a **Continue with Google** button will automatically appear on the login page.

## GitHub OAuth

To allow users to sign in with GitHub, create an OAuth Application from your GitHub Developer Settings.

### Callback URL

```text
http://localhost:8000/auth/callback/github
```

For production:

```text
https://api.example.com/auth/callback/github
```

### Environment Variables

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

Restart the server after saving your configuration.

## Security Notes

### Use HTTPS

For production deployments, always use HTTPS.

Authentication providers such as Google and GitHub may reject callback URLs that use plain HTTP.

```text
https://analytics.example.com
```

### Keep Secrets Private

Never commit OAuth credentials or API keys to source control.

Store them in environment variables or a secure secrets manager.

## Troubleshooting

### OAuth Login Fails

Check the following:

- Client ID is correct
- Client Secret is correct
- Callback URL matches exactly
- BASE_URL is configured correctly

### Invalid Redirect URI

This usually means the callback URL configured in Google or GitHub does not exactly match the URL Trackion is using.

Double-check:

```text
http://localhost:8000/auth/callback/google
```

or

```text
http://localhost:8000/auth/callback/github
```

including protocol, domain, port, and path.

### Verification Emails Are Not Sent

Verify:

- RESEND_API_KEY is configured
- The API key is valid
- Your domain is verified in Resend

For local, check the server logs for verification links.

That's it. Once configured, users can authenticate using the providers you've enabled and start using your self-hosted Trackion instance.
