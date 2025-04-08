export const FAKE_USER_LOCATION = Object.freeze({
    COUNTRY: 'Austria',
    ISO_CODE: 'AT',
    TIMEZONE: 'Europe/Vienna',
    IP_OCTETS: [137, 208, 0, 0],
});

export const ROUTE = Object.freeze({
    USER_LOCATION: '/api/v1/accounts/users/location',
    RELEASES: '/api/v1/anime/releases/',
    RELEASES_LATEST: '/api/v1/anime/releases/latest',
    RELEASES_RANDOM: '/api/v1/anime/releases/random',
});

export const PROXY_API_URL = 'https://api.allorigins.win/get?url=';