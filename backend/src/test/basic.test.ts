describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should work with test utilities', () => {
    const testUtils = global.testUtils;
    expect(testUtils).toBeDefined();
    expect(typeof testUtils.createMockJWT).toBe('function');
  });
});
