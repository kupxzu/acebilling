<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        
        <p>Hello {{ $userName }},</p>
        
        <p>You recently requested to reset your password for your account. Click the button below to reset it.</p>
        
        <a href="{{ $resetUrl }}" class="button">Reset Password</a>
        
        <p>If you didn't request a password reset, please ignore this email. Your password won't be changed.</p>
        
        <p>This password reset link will expire in 2 hours for security reasons.</p>
        
        <div class="footer">
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{{ $resetUrl }}</p>
        </div>
    </div>
</body>
</html>