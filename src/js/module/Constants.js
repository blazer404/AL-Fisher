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
    EPISODES: '/api/v1/anime/releases/episodes/',
});

export const PROXY_API_URL = 'https://api.allorigins.win/get?url=';
export const FAKE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.0';