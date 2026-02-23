import { speechmaticsService } from '../speechmatics.service';

describe('SpeechmaticsService', () => {
    describe('parseTranscript', () => {
        it('should correctly join words with spaces', () => {
            const mockData = {
                results: [
                    { type: 'word', alternatives: [{ content: 'Hola' }] },
                    { type: 'word', alternatives: [{ content: 'mundo' }] }
                ]
            };
            const result = speechmaticsService.parseTranscript(mockData);
            expect(result).toBe('Hola mundo');
        });

        it('should not add space before punctuation', () => {
            const mockData = {
                results: [
                    { type: 'word', alternatives: [{ content: 'Hola' }] },
                    { type: 'punctuation', alternatives: [{ content: '!' }] }
                ]
            };
            const result = speechmaticsService.parseTranscript(mockData);
            expect(result).toBe('Hola!');
        });

        it('should return empty string if data is invalid', () => {
            expect(speechmaticsService.parseTranscript(null)).toBe('');
            expect(speechmaticsService.parseTranscript({})).toBe('');
            expect(speechmaticsService.parseTranscript({ results: [] })).toBe('');
        });
    });
});
