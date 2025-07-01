import calculatePerc from './src/utils';
describe('App', () => {
    //unit test
    it('should work', () => {
        const discount = calculatePerc(100, 10);
        expect(discount).toBe(10);
    });
});
