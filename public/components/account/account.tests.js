console.log('a');
describe("A suite", function() {
    console.log('b', typeof(it));
    it("contains spec with an expectation", function() {
        console.log('c');
        expect(true).toBe(false);
    });
});