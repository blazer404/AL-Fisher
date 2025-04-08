export class DataValidator {
    static isValidResponse(response) {
        return response && response.ok && response.headers.get('content-type')?.includes('application/json');
    }

    static isValidData(data) {
        return data && typeof data === 'object';
    }
}