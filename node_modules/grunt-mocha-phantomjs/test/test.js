describe('Test', function(){

  describe('should pass', function(){
    it("should equal 2", function() {
      expect(1+1).to.equal(2);
    });

    it("should not equal 3", function() {
      expect(1+1).to.not.equal(3);
    });

    it("should equal 3", function() {
      expect(1+1+1).to.equal(3);
    });
  });
});