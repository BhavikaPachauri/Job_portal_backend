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

## Testing the Password Reset Flow

### 1. Start the Server
```bash
npm start
```

### 2. Test with Swagger UI
- Go to: `http://localhost:3000/api-docs`
- Test the endpoints:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/verify-reset-token`
  - `POST /api/auth/reset-password`

### 3. Test with the Test Script
```bash
node test-password-reset.js
```

### 4. Manual Testing
1. **Request Password Reset:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com"}'
   ```

2. **Check Email** for the reset link

3. **Verify Token** (optional):
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-reset-token \
     -H "Content-Type: application/json" \
     -d '{"token": "your-reset-token"}'
   ```

4. **Reset Password:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token": "your-reset-token",
       "newPassword": "NewPassword123!",
       "confirmPassword": "NewPassword123!"
     }'
   ```

## Password Requirements

The new password must meet these criteria:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number
- Contains at least one special character

## Security Features

- **Reset tokens expire** after 1 hour
- **Tokens are cleared** after successful password reset
- **Email addresses are not revealed** if they don't exist (security best practice)
- **Confirmation emails** are sent after successful password reset
- **Password strength validation** ensures secure passwords

## Troubleshooting

### Email Not Sending
1. Check your `.env` file configuration
2. Verify Gmail app password is correct
3. Check if 2FA is enabled on Gmail
4. Check server logs for email errors

### Token Issues
1. Tokens expire after 1 hour
2. Each new request generates a new token
3. Old tokens are invalidated

### Common Errors
- `Invalid credentials`: Email/password combination is wrong
- `Invalid or expired token`: Reset token is invalid or expired
- `Passwords do not match`: New password and confirm password don't match
- `Password validation failed`: New password doesn't meet requirements

## API Endpoints

### Forgot Password
- **URL:** `POST /api/auth/forgot-password`
- **Body:** `{"email": "user@example.com"}`
- **Response:** Success message (same for existing/non-existing emails)

### Verify Reset Token
- **URL:** `POST /api/auth/verify-reset-token`
- **Body:** `{"token": "reset-token"}`
- **Response:** Token validity status

### Reset Password
- **URL:** `POST /api/auth/reset-password`
- **Body:** `{"token": "reset-token", "newPassword": "NewPass123!", "confirmPassword": "NewPass123!"}`
- **Response:** Success message

## Frontend Integration

The reset URL format is:
```
${FRONTEND_URL}/reset-password?token=${resetToken}
```

Example: `http://localhost:3000/reset-password?token=abc123def456...` 