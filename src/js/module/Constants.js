export const PROXY_API_URL = 'https://api.allorigins.win/get?url=';

export const FAKE_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.0';

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

export const MESSAGE_LIB = Object.freeze({
    INIT: 'Инициализация перехватчика...',
    HANDLER_ERROR: 'Произошла ошибка при обработке запроса:',
    TRANSFORM_RUNNING: 'Модификация ответа для',
    TRANSFORM_FINISHED: 'Ответ модифицирован для',
    TRANSFORM_FAILED: 'Ответ не был модифицирован для',
    TRANSFORM_ERROR: 'Ошибка модификации ответа:',
    PROXY_RUNNING: 'Запрос обработан, запущено проксирование',
    PROXY_FINISHED: 'Проксирование завершено',
    PROXY_FAILED: 'Проксирование не удалось',
    URL_CHECK_ERROR: 'Ошибка при проверке URL:',
    WRONG_DATA: 'Переданы некорректные данные',
    WRONG_RESPONSE: 'Получен некорректный ответ от сервера',
});