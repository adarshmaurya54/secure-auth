import { NextResponse } from 'next/server'
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production'

    //access token
    response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/"
    })

    // refresh token
    response.cookies.set(
        "refresh_token",
        refreshToken,
        {
            httpOnly: true,
            secure: isProd,
            sameSite: "strict",
            maxAge:
                60 *
                60 *
                24 *
                30, // 30 days

            // only refresh endpoint can access
            path: "/",
        }
    )
}

export function clearAuthCookies(
    response: NextResponse
) {
    response.cookies.set(
        "access_token",
        "",
        {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
        }
    );

    response.cookies.set(
        "refresh_token",
        "",
        {
            httpOnly: true,
            expires: new Date(0),
            path:
                "/",
        }
    );
}