
export function repeat(count: number, fn: (i: number) => void ) {
// function repeat(count, fn) {
  for (let i=0; i<count; i++) {
    fn(i);
  }
}


