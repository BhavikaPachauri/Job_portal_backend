# Email Setup for Password Reset

## Configuration Required

To enable password reset functionality, you need to configure email settings in your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Other Email Providers

You can also use:
- **Outlook:** `service: 'outlook'`
- **Yahoo:** `service: 'yahoo'`
- **Custom SMTP:** Configure in `utils/emailUtils.js`

## Testing

1. Start your server: `npm start`
2. Go to Swagger UI: `http://localhost:3000/api-docs`
3. Test the forgot password endpoint: `POST /api/auth/forgot-password`
4. Check your email for the reset link

## Security Notes

- Reset tokens expire after 1 hour
- Tokens are cleared after successful password reset
- Email addresses are not revealed if they don't exist (security best practice) 