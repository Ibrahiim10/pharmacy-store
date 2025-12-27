import React from 'react'
import RegisterForm from '../../components/auth/RegisterForm'
import LoginForm from '../../components/auth/LoginForm'

const LoginPage = () => {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-background'>
            <div className='absolute insert-0 bg-gradient-to-br from-secondary to-secondary/20 opacity-50' />

            <div className='z-10 w-full max-w-md px-4'>
                <div className='mb-8 text-center'>
                    <h1 className='text-3xl font-bold text-foreground'>Welcome back</h1>
                    <p>We're glad to see you again</p>
                </div>

                {/* Login Form */}
                <LoginForm />
            </div>
        </div>
    )
}

export default LoginPage
