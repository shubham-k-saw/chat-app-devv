export const emailVerifyTemplate = (otp) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 class="text-2xl font-bold mb-6 text-center">OTP Verification</h2>
                <p class="mb-4">Dear User</p>
                <p class="mb-4">Please use the following One Time Password ${otp} to complete your verification process. This OTP is valid for a limited time only.</p>
                <div class="mb-4">
                    <span class="font-bold text-lg">OTP:</span>
                    <span class="text-lg">${otp}</span>
                </div>
                <p class="mb-4">If you did not request this OTP, please ignore this email.</p>
                <p class="mt-6 text-gray-600 text-center">Thank you,</p>
            </div>
        </div>
    </body>
    </html>
`


export const successfullyVerifyEmailTemplate = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Successful</title>
        <style>
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 class="text-2xl font-bold mb-6 text-center">Verification Successful</h2>
                <p class="mb-4">Dear User,</p>
                <p class="mb-4">Congratulations! Your email has been successfully verified. You can now enjoy all the features and services we offer.</p>
                <p class="mb-4">If you have any questions or need further assistance, please do not hesitate to contact our support team.</p>
                <p class="mt-6 text-gray-600 text-center">Thank you for choosing us!</p>
                <p class="text-gray-600 text-center">[Your Company Name]</p>
            </div>
        </div>
    </body>
    </html>
`
