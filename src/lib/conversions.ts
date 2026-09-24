export const DIGITS = "0123456789ABCDEF";

function digitChar(i: number): string {
  return DIGITS[i] ?? "0";
}

export type Base = 2 | 8 | 10 | 16;

export const baseName: Record<Base, string> = {
  2: "Binario",
  8: "Octal",
  10: "Decimal",
  16: "Hexadecimal",
};

export function isValidInBase(value: string, base: Base): boolean {
  const clean = value.trim().toUpperCase();
  if (!clean) return false;
  const allowed = DIGITS.slice(0, base);
  return clean.split("").every((c) => allowed.includes(c));
}

export function parseInBase(value: string, base: Base): number {
  const clean = value.trim().toUpperCase();
  return clean
    .split("")
    .reduce((acc, c) => acc * base + DIGITS.indexOf(c), 0);
}

export function toBase(n: number, base: Base): string {
  if (n === 0) return "0";
  let out = "";
  let x = n;
  while (x > 0) {
    out = digitChar(x % base) + out;
    x = Math.floor(x / base);
  }
  return out;
}

/* ---------- Divisiones sucesivas (decimal -> base) ---------- */

export interface DivStep {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export function divisionSteps(n: number, base: Base): DivStep[] {
  const steps: DivStep[] = [];
  let current = n;
  while (current >= base) {
    const quotient = Math.floor(current / base);
    const remainder = current % base;
    steps.push({ dividend: current, divisor: base, quotient, remainder });
    current = quotient;
  }
  return steps;
}

/** Dígitos del resultado leídos como en clase: último cociente + restos de abajo a arriba. */
export function divisionResultDigits(n: number, base: Base): string[] {
  const steps = divisionSteps(n, base);
  if (steps.length === 0) return [digitChar(n)];
  const last = steps[steps.length - 1]!;
  const digits = [digitChar(last.quotient)];
  for (let i = steps.length - 1; i >= 0; i--) {
    digits.push(digitChar(steps[i]!.remainder));
  }
  return digits;
}

/* ---------- Teorema Fundamental de la Numeración (base -> decimal) ---------- */

export interface TfnTerm {
  digit: string;
  digitValue: number;
  exponent: number;
  power: number;
  product: number;
}

export function tfnTerms(value: string, base: Base): TfnTerm[] {
  const clean = value.trim().toUpperCase();
  const n = clean.length;
  return clean.split("").map((digit, i) => {
    const exponent = n - 1 - i;
    const digitValue = DIGITS.indexOf(digit);
    const power = Math.pow(base, exponent);
    return { digit, digitValue, exponent, power, product: digitValue * power };
  });
}

/* ---------- Agrupación de bits (binario <-> octal / hex) ---------- */

export interface Group {
  bits: string;
  digit: string;
}

/** Agrupa un binario en grupos de size bits (desde la derecha) y da su dígito. */
export function groupBits(binary: string, size: 3 | 4): Group[] {
  const clean = binary.trim();
  const pad = (size - (clean.length % size)) % size;
  const padded = "0".repeat(pad) + clean;
  const groups: Group[] = [];
  for (let i = 0; i < padded.length; i += size) {
    const bits = padded.slice(i, i + size);
    groups.push({ bits, digit: digitChar(parseInt(bits, 2)) });
  }
  return groups;
}

/** Cada dígito octal/hex a su bloque de bits. */
export function digitsToBits(value: string, size: 3 | 4): Group[] {
  return value
    .trim()
    .toUpperCase()
    .split("")
    .map((digit) => ({
      digit,
      bits: DIGITS.indexOf(digit).toString(2).padStart(size, "0"),
    }));
}

export function stripLeadingZeros(s: string): string {
  const out = s.replace(/^0+/, "");
  return out === "" ? "0" : out;
}
