/**
 * important! this file is only to ensure we parse files with Flow annotation
 * properly. The formatting of typeAnnotation should be handled by an external
 * plugin since not all users will require this feature and implementation is
 * pretty complex.
 * @flow
 */
function foo(a: string, b: number): void {
  return a + String(b);
}

var x: boolean = someBool;

class Bar {
  y: string;
  someMethod(a: number): string {
    return a * 2;
  }
}
