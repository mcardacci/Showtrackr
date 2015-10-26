describe('service', function() {
	beforeEach(module('MyApp'));

	describe('Auth', function () {
		it('should be defined', inject(function (Auth) {
			expect(Auth).toBeDefined();
		}));
	});
});