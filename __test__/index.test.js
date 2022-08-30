import add from '../src/index.js';

describe('index.js', () => {
  const data = [
    [1, 2, 3],
    [4, 6, 10],
    [19, 11, 30],
    [53, 99, 152],
  ];

  test.each(data)('add %i to %i', (a, b, sum) => {
    expect(add(a, b)).toBe(sum);
  });
});
