'use server'

import { cookies } from 'next/headers'

export async function loginUser() {
    const cookieStore = await cookies();

    cookieStore.set('isLoggedIn', 'true', {
        httpOnly: true,
        path: '/',
        secure: true,
        maxAge: 60 * 60 * 24, // 1 day
    })
}