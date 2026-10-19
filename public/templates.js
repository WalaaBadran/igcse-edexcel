// Question templates: each makes a new random question, its answer, and step-by-step working.
// Written for this site (AI help), not taken from past papers.
(function () {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
  };
  const dec = x => String(Number(x.toFixed(2)));
  const signed = c => (c >= 0 ? `+ ${c}` : `− ${-c}`);
  const signedX = c => (c === 0 ? '' : c > 0 ? ` + ${c}x` : ` − ${-c}x`);
  const signedC = c => (c === 0 ? '' : c > 0 ? ` + ${c}` : ` − ${-c}`);
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
  const pad = n => String(n).padStart(2, '0');
  const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
  const T = [];
  const add = (id, topic, level, tier, gen) => T.push({ id, topic, level, tier, gen });

  add('t-pct1', 'Percentages', 1, 'FH', () => {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), n = 20 * r(1, 10);
    const v = (n * p) / 100;
    return { q: `Work out ${p}% of ${n}.`, a: dec(v), steps: [`1% of ${n} = ${n} ÷ 100 = ${dec(n / 100)}`, `${p}% of ${n} = ${dec(n / 100)} × ${p} = ${dec(v)}`] };
  });
  add('t-pct2', 'Percentages', 3, 'FH', () => {
    const p = 10 * r(2, 30), x = pick([5, 10, 15, 20, 25]), up = Math.random() < 0.5;
    const res = up ? (p * (100 + x)) / 100 : (p * (100 - x)) / 100;
    const mult = up ? `${100 + x}% = ${(100 + x) / 100}` : `${100 - x}% = ${(100 - x) / 100}`;
    return {
      q: `A price of £${p} ${up ? 'increases' : 'decreases'} by ${x}%. What is the new price?`,
      a: `£${dec(res)}`,
      steps: [`${up ? 'Increase' : 'Decrease'} by ${x}%, so the new price is ${mult} of the original`, `New price = £${p} × ${(up ? 100 + x : 100 - x) / 100} = £${dec(res)}`]
    };
  });
  add('t-pct3', 'Percentages', 4, 'H', () => {
    const o = 20 * r(2, 20), x = pick([10, 20, 25, 50]), P = (o * (100 + x)) / 100;
    return {
      q: `After a ${x}% increase, a price is £${dec(P)}. What was the original price?`,
      a: `£${dec(o)}`,
      steps: [`After a ${x}% increase the price is ${(100 + x) / 100} times the original`, `Original price = £${dec(P)} ÷ ${(100 + x) / 100} = £${dec(o)}`]
    };
  });
  add('t-frac1', 'Fractions', 2, 'FH', () => {
    const d1 = pick([2, 3, 4, 5, 6, 8, 10]), d2 = pick([2, 3, 4, 5, 6, 8, 10]);
    const n1 = r(1, d1 - 1), n2 = r(1, d2 - 1), d = (d1 * d2) / gcd(d1, d2);
    const n = n1 * (d / d1) + n2 * (d / d2);
    return {
      q: `Work out ${n1}/${d1} + ${n2}/${d2}. Give your answer in its simplest form.`,
      a: frac(n, d),
      steps: [`Common denominator: ${d}`, `${n1}/${d1} = ${n1 * (d / d1)}/${d} and ${n2}/${d2} = ${n2 * (d / d2)}/${d}`, `Add the numerators: ${n1 * (d / d1)} + ${n2 * (d / d2)} = ${n}, so the answer is ${n}/${d}`, `Simplest form: ${frac(n, d)}`]
    };
  });
  add('t-frac2', 'Fractions', 2, 'FH', () => {
    const b = pick([2, 3, 4, 5, 6, 8, 10]), a = r(1, b - 1), N = b * r(2, 12);
    return {
      q: `Work out ${a}/${b} of ${N}.`,
      a: String((N / b) * a),
      steps: [`Divide by the denominator: ${N} ÷ ${b} = ${N / b}`, `Multiply by the numerator: ${N / b} × ${a} = ${(N / b) * a}`]
    };
  });
  add('t-ratio1', 'Ratio', 3, 'FH', () => {
    const a = r(1, 6), b = r(1, 6), part = r(5, 20), total = (a + b) * part;
    return {
      q: `Share £${total} in the ratio ${a} : ${b}.`,
      a: `£${a * part} and £${b * part}`,
      steps: [`Total parts: ${a} + ${b} = ${a + b}`, `One part: £${total} ÷ ${a + b} = £${part}`, `First share: ${a} × £${part} = £${a * part}`, `Second share: ${b} × £${part} = £${b * part}`]
    };
  });
  add('t-eq1', 'Solving equations', 2, 'FH', () => {
    const a = r(2, 9), x = r(-6, 12), b = r(-12, 12), c = a * x + b;
    return {
      q: `Solve ${a}x ${signed(b)} = ${c}.`,
      a: `x = ${x}`,
      steps: [`Subtract ${b >= 0 ? b : `(${b})`} from both sides: ${a}x = ${c - b}`, `Divide both sides by ${a}: x = ${c - b} ÷ ${a} = ${x}`]
    };
  });
  add('t-eq2', 'Solving equations', 4, 'H', () => {
    let a, c;
    do { a = r(2, 6); c = r(1, 6); } while (a === c);
    const x = r(-4, 8), b = r(-5, 5), d = a * (x + b) - c * x;
    return {
      q: `Solve ${a}(x ${signed(b)}) = ${c}x ${signed(d)}.`,
      a: `x = ${x}`,
      steps: [`Expand the bracket: ${a}x ${signed(a * b)} = ${c}x ${signed(d)}`, `Collect the x terms on one side: ${a - c}x = ${d - a * b}`, `Divide by ${a - c}: x = ${d - a * b} ÷ ${a - c} = ${x}`]
    };
  });
  add('t-ineq1', 'Inequalities', 3, 'FH', () => {
    const a = r(1, 5), k = r(-4, 8), b = r(-6, 6), c = a * k + b;
    return {
      q: `Solve ${a}x ${signed(b)} < ${c}.`,
      a: `x < ${k}`,
      steps: [`Subtract ${b >= 0 ? b : `(${b})`} from both sides: ${a}x < ${c - b}`, `Divide both sides by ${a} (positive, so the sign stays the same): x < ${k}`]
    };
  });
  add('t-seq1', 'Sequences', 3, 'FH', () => {
    const d = r(2, 9), s = r(-5, 20), n = pick([10, 12, 15, 20]), term = s + (n - 1) * d, c0 = s - d;
    return {
      q: `A sequence starts ${s}, ${s + d}, ${s + 2 * d}, … Find the ${n}th term.`,
      a: `${term}`,
      steps: [`The common difference is ${d}`, `nth term = ${d}n ${signed(c0)}`, `${n}th term = ${d} × ${n} ${signed(c0)} = ${term}`]
    };
  });
  add('t-ang1', 'Angles', 2, 'FH', () => {
    const a = r(20, 80), b = r(20, 170 - a);
    return {
      q: `A triangle has angles ${a}° and ${b}°. Find the third angle.`,
      a: `${180 - a - b}°`,
      steps: [`Angles in a triangle add up to 180°`, `Third angle = 180° − ${a}° − ${b}° = ${180 - a - b}°`]
    };
  });
  add('t-poly1', 'Polygons', 3, 'FH', () => {
    const n = r(5, 12);
    return {
      q: `Find the sum of the interior angles of a polygon with ${n} sides.`,
      a: `${(n - 2) * 180}°`,
      steps: [`A polygon with ${n} sides splits into ${n - 2} triangles`, `Sum = ${n - 2} × 180° = ${(n - 2) * 180}°`]
    };
  });
  add('t-poly2', 'Polygons', 4, 'H', () => {
    const n = pick([3, 4, 5, 6, 8, 9, 10, 12, 15]);
    return {
      q: `Find the size of one interior angle of a regular polygon with ${n} sides.`,
      a: `${((n - 2) * 180) / n}°`,
      steps: [`Sum of interior angles = (${n} − 2) × 180° = ${(n - 2) * 180}°`, `All ${n} angles are equal, so one angle = ${(n - 2) * 180}° ÷ ${n} = ${((n - 2) * 180) / n}°`]
    };
  });
  add('t-area1', 'Area and perimeter', 1, 'FH', () => {
    const l = r(2, 15), w = r(2, 12);
    return {
      q: `A rectangle is ${l} cm long and ${w} cm wide. Find its area.`,
      a: `${l * w} cm²`,
      steps: [`Area of a rectangle = length × width`, `${l} × ${w} = ${l * w} cm²`]
    };
  });
  add('t-area2', 'Area and perimeter', 2, 'FH', () => {
    const b = 2 * r(2, 12), h = r(2, 12);
    return {
      q: `A triangle has base ${b} cm and height ${h} cm. Find its area.`,
      a: `${(b * h) / 2} cm²`,
      steps: [`Area of a triangle = ½ × base × height`, `½ × ${b} × ${h} = ${(b * h) / 2} cm²`]
    };
  });
  add('t-area3', 'Area and perimeter', 3, 'FH', () => {
    const rr = r(2, 12);
    return {
      q: `A circle has radius ${rr} cm. Find its area. Use π = 3.14.`,
      a: `${dec(3.14 * rr * rr)} cm²`,
      steps: [`Area of a circle = π × radius²`, `radius² = ${rr} × ${rr} = ${rr * rr}`, `Area = 3.14 × ${rr * rr} = ${dec(3.14 * rr * rr)} cm²`]
    };
  });
  add('t-circ1', 'Circles', 3, 'FH', () => {
    const rr = r(2, 12);
    return {
      q: `A circle has radius ${rr} cm. Find its circumference. Use π = 3.14.`,
      a: `${dec(2 * 3.14 * rr)} cm`,
      steps: [`Circumference = 2 × π × radius`, `2 × 3.14 × ${rr} = ${dec(2 * 3.14 * rr)} cm`]
    };
  });
  add('t-vol1', 'Volume', 2, 'FH', () => {
    const l = r(2, 10), w = r(2, 10), h = r(2, 10);
    return {
      q: `A cuboid is ${l} cm by ${w} cm by ${h} cm. Find its volume.`,
      a: `${l * w * h} cm³`,
      steps: [`Volume of a cuboid = length × width × height`, `${l} × ${w} × ${h} = ${l * w * h} cm³`]
    };
  });
  add('t-pyth1', 'Pythagoras and trigonometry', 3, 'FH', () => {
    const [a, b, c] = pick(TRIPLES), k = r(1, 3);
    const A = a * k, B = b * k, C = c * k;
    return {
      q: `A right-angled triangle has shorter sides ${A} cm and ${B} cm. Find the hypotenuse.`,
      a: `${C} cm`,
      steps: [`Pythagoras: hypotenuse² = ${A}² + ${B}²`, `= ${A * A} + ${B * B} = ${A * A + B * B}`, `Hypotenuse = √${A * A + B * B} = ${C} cm`]
    };
  });
  add('t-pyth2', 'Pythagoras and trigonometry', 4, 'H', () => {
    const h = 2 * r(3, 12);
    return {
      q: `A right-angled triangle has hypotenuse ${h} cm. The side x is opposite an angle of 30°. Find x.`,
      a: `${h / 2} cm`,
      steps: [`sin 30° = opposite ÷ hypotenuse`, `x = ${h} × sin 30° = ${h} × 0.5 = ${h / 2} cm`]
    };
  });
  add('t-prob1', 'Probability', 2, 'FH', () => {
    const red = r(1, 9), blue = r(1, 9);
    return {
      q: `A bag has ${red} red and ${blue} blue counters. One counter is picked at random. What is the probability it is red?`,
      a: frac(red, red + blue),
      steps: [`Total counters: ${red} + ${blue} = ${red + blue}`, `P(red) = number of red ÷ total = ${red}/${red + blue}`]
    };
  });
  add('t-prob2', 'Probability', 2, 'FH', () => {
    const k = r(1, 9);
    return {
      q: `The probability of rain tomorrow is ${dec(k / 10)}. What is the probability that it does not rain?`,
      a: dec(1 - k / 10),
      steps: [`Probabilities of all outcomes add up to 1`, `P(no rain) = 1 − ${dec(k / 10)} = ${dec(1 - k / 10)}`]
    };
  });
  add('t-mean1', 'Averages', 3, 'FH', () => {
    const n = r(3, 6), m = r(5, 20);
    let vals, last, total;
    do {
      vals = [];
      let sum = 0;
      for (let i = 0; i < n - 1; i++) { const v = r(Math.max(1, m - 5), m + 5); vals.push(v); sum += v; }
      last = m * n - sum;
      total = m * n;
    } while (last <= 0);
    const known = total - last;
    return {
      q: `The mean of ${n} numbers is ${m}. Four of the numbers are ${vals.join(', ')}. Find the other number.`,
      a: String(last),
      steps: [`Total of all ${n} numbers = ${m} × ${n} = ${total}`, `Total of the known numbers = ${vals.join(' + ')} = ${known}`, `Other number = ${total} − ${known} = ${last}`]
    };
  });
  add('t-unit1', 'Measures', 1, 'FH', () => {
    const k = r(2, 9), pair = pick([['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000]]);
    return {
      q: `Change ${k} ${pair[0]} into ${pair[1]}.`,
      a: `${k * pair[2]} ${pair[1]}`,
      steps: [`1 ${pair[0]} = ${pair[2]} ${pair[1]}`, `${k} × ${pair[2]} = ${k * pair[2]} ${pair[1]}`]
    };
  });
  add('t-time1', 'Measures', 2, 'FH', () => {
    const h = r(0, 20), m = pick([0, 15, 30, 45]), dh = r(1, 4), dm = pick([0, 15, 30, 45]);
    const tot = h * 60 + m + dh * 60 + dm;
    const endH = Math.floor(tot / 60) % 24, endM = tot % 60;
    return {
      q: `A film starts at ${pad(h)}:${pad(m)} and lasts ${dh} hours ${dm} minutes. What time does it finish? Use the 24-hour clock.`,
      a: `${pad(endH)}:${pad(endM)}`,
      steps: [`Add the hours: ${pad(h)} + ${dh} = ${pad((h + dh) % 24)}`, `Add the minutes: ${pad(m)} + ${dm} = ${pad(m + dm)}`, `Check if minutes are 60 or more, and adjust the hours if needed. The finish time is ${pad(endH)}:${pad(endM)}`]
    };
  });
  add('t-speed1', 'Speed, distance and time', 2, 'FH', () => {
    const s = r(20, 90), t = r(2, 6);
    return {
      q: `A car travels at ${s} km/h for ${t} hours. How far does it travel?`,
      a: `${s * t} km`,
      steps: [`Distance = speed × time`, `${s} × ${t} = ${s * t} km`]
    };
  });
  add('t-ci1', 'Money and interest', 5, 'H', () => {
    const P = 100 * r(1, 50), rate = pick([2, 3, 4, 5, 6]), n = r(2, 4);
    const mult = 1 + rate / 100;
    const A = P * Math.pow(mult, n);
    return {
      q: `£${P} is invested at ${rate}% compound interest per year for ${n} years. Find the total amount, to the nearest penny.`,
      a: `£${A.toFixed(2)}`,
      steps: [`Multiplier each year = 1 + ${rate}/100 = ${mult}`, `After ${n} years: £${P} × ${mult}^${n}`, `= £${A.toFixed(2)}`]
    };
  });
  add('t-std1', 'Standard form', 4, 'H', () => {
    const a = r(2, 9), b = r(2, 9), p = r(2, 6), q = r(2, 6);
    const prod = a * b;
    let m = prod, ex = p + q;
    if (m >= 10) { m /= 10; ex += 1; }
    return {
      q: `Work out (${a} × 10^${p}) × (${b} × 10^${q}). Give your answer in standard form.`,
      a: `${dec(m)} × 10^${ex}`,
      steps: [`Multiply the numbers: ${a} × ${b} = ${prod}`, `Add the powers: 10^${p} × 10^${q} = 10^${p + q}`, `Write in standard form: ${prod} × 10^${p + q} = ${dec(m)} × 10^${ex}`]
    };
  });
  add('t-grad1', 'Graphs', 3, 'H', () => {
    const x1 = r(-5, 5), y1 = r(-5, 5), dx = pick([1, 2, 3, 4, 5]), dy = r(-6, 6);
    return {
      q: `Find the gradient of the line through (${x1}, ${y1}) and (${x1 + dx}, ${y1 + dy}).`,
      a: frac(dy, dx),
      steps: [`Gradient = change in y ÷ change in x`, `= (${y1 + dy} − ${y1}) ÷ (${x1 + dx} − ${x1}) = ${dy} ÷ ${dx} = ${frac(dy, dx)}`]
    };
  });
  add('t-line1', 'Graphs', 4, 'H', () => {
    const m = pick([-3, -2, -1, 1, 2, 3, 4]), x0 = r(-4, 4), y0 = r(-6, 8), c = y0 - m * x0;
    return {
      q: `A straight line has gradient ${m} and passes through (${x0}, ${y0}). Find its equation.`,
      a: `y = ${m}x ${signed(c)}`,
      steps: [`Use y = mx + c with m = ${m}`, `Substitute (${x0}, ${y0}): ${y0} = ${m} × ${x0} + c`, `c = ${y0} − ${m * x0} = ${c}`, `Equation: y = ${m}x ${signed(c)}`]
    };
  });
  add('t-sim1', 'Simultaneous equations', 5, 'H', () => {
    const x = r(-4, 6), y = r(-4, 6), a = r(1, 4), b = pick([1, 2, 3]);
    const c1 = a * x + b * y, c2 = x - y;
    return {
      q: `Solve the simultaneous equations ${a}x + ${b}y = ${c1} and x − y = ${c2}.`,
      a: `x = ${x}, y = ${y}`,
      steps: [`From the second equation: x = y + ${c2}`, `Substitute into the first: ${a}(y + ${c2}) + ${b}y = ${c1}`, `${a + b}y = ${c1 - a * c2}, so y = ${y}`, `x = ${y} + ${c2} = ${x}`]
    };
  });
  add('t-exp1', 'Expressions', 4, 'H', () => {
    const a = pick([1, 2, 3, 4, 5, 6, -1, -2, -3]), b = pick([1, 2, 3, 4, 5, 6, -1, -2, -3]);
    const s = a + b, p = a * b;
    return {
      q: `Expand and simplify (x ${signed(a)})(x ${signed(b)}).`,
      a: `x²${signedX(s)}${signedC(p)}`,
      steps: [`Multiply each term in the first bracket by each term in the second`, `x × x = x², x × ${b} = ${b}x, ${a} × x = ${a}x, ${a} × ${b} = ${p}`, `Collect the terms: x²${signedX(s)}${signedC(p)}`]
    };
  });
  add('t-fac1', 'Expressions', 4, 'H', () => {
    const a = pick([1, 2, 3, 4, 5, 6, -1, -2, -3]), b = pick([1, 2, 3, 4, 5, 6, -1, -2, -3]);
    return {
      q: `Factorise x² ${signedX(a + b)}${signedC(a * b)}.`,
      a: `(x ${signed(a)})(x ${signed(b)})`,
      steps: [`Find two numbers that multiply to ${a * b} and add to ${a + b}`, `Those numbers are ${a} and ${b}`, `So x² ${signedX(a + b)}${signedC(a * b)} = (x ${signed(a)})(x ${signed(b)})`]
    };
  });
  add('t-trig2', 'Pythagoras and trigonometry', 4, 'H', () => {
    const adj = 2 * r(3, 12);
    return {
      q: `A right-angled triangle has an adjacent side of ${adj} cm and the angle between the adjacent side and the hypotenuse is 60°. Find the hypotenuse.`,
      a: `${adj * 2} cm`,
      steps: [`cos 60° = adjacent ÷ hypotenuse`, `hypotenuse = ${adj} ÷ cos 60° = ${adj} ÷ 0.5 = ${adj * 2} cm`]
    };
  });

  add('t-idx1', 'Indices, HCF and LCM', 2, 'FH', () => {
    const b = pick(['x', 'a', 'y']), m = r(2, 7), n = r(2, 7);
    return {
      q: `Simplify ${b}${sup(m)} × ${b}${sup(n)}.`,
      a: `${b}${sup(m + n)}`,
      steps: [`When multiplying powers with the same base, add the powers`, `${m} + ${n} = ${m + n}`, `Answer: ${b}${sup(m + n)}`]
    };
  });
  add('t-idx2', 'Indices, HCF and LCM', 3, 'H', () => {
    const b = pick([2, 3, 5]), n = r(1, 4);
    return {
      q: `Work out ${b}^(−${n}). Give your answer as a fraction.`,
      a: frac(1, b ** n),
      steps: [`A negative power means the reciprocal: ${b}^(−${n}) = 1 ÷ ${b}^${n}`, `${b}^${n} = ${b ** n}`, `Answer: 1/${b ** n}`]
    };
  });
  add('t-hcf1', 'Indices, HCF and LCM', 2, 'FH', () => {
    const [p, q] = pick([[2, 3], [3, 5], [2, 5], [3, 4], [4, 5], [5, 6]]), k = r(2, 9);
    const a = k * p, b = k * q;
    return {
      q: `Find the highest common factor (HCF) of ${a} and ${b}.`,
      a: `${k}`,
      steps: [`Write both numbers as ${k} × something: ${a} = ${k} × ${p} and ${b} = ${k} × ${q}`, `${p} and ${q} have no common factor, so the HCF is ${k}`]
    };
  });
  add('t-lcm1', 'Indices, HCF and LCM', 3, 'FH', () => {
    const [p, q] = pick([[2, 3], [3, 5], [2, 5], [3, 4], [4, 5], [5, 6]]), k = r(2, 9);
    const a = k * p, b = k * q;
    return {
      q: `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
      a: `${k * p * q}`,
      steps: [`Write both numbers as ${k} × something: ${a} = ${k} × ${p} and ${b} = ${k} × ${q}`, `LCM = ${k} × ${p} × ${q} (${p} and ${q} have no common factor)`, `= ${k * p * q}`]
    };
  });
  add('t-surd1', 'Surds', 4, 'H', () => {
    const s = r(2, 6), m = pick([2, 3, 5, 7]);
    return {
      q: `Write √${s * s * m} in its simplest form.`,
      a: `${s}√${m}`,
      steps: [`Find a square factor: ${s * s * m} = ${s * s} × ${m}`, `√${s * s * m} = √${s * s} × √${m} = ${s}√${m}`]
    };
  });
  add('t-round1', 'Bounds and accuracy', 2, 'FH', () => {
    const M = r(1000, 9999), x = M / 1000;
    const rounded = Math.round(M / 10) / 100;
    const third = M % 10, second = Math.floor(M / 10) % 10;
    return {
      q: `Round ${x.toFixed(3)} to 2 decimal places.`,
      a: dec(rounded),
      steps: [`The third decimal digit is ${third}`, third >= 5 ? `${third} is 5 or more, so round the second decimal digit (${second}) up` : `${third} is less than 5, so keep the second decimal digit (${second}) the same`, `Answer: ${dec(rounded)}`]
    };
  });
  add('t-bounds2', 'Bounds and accuracy', 4, 'H', () => {
    const v = r(10, 90) / 10;
    return {
      q: `A length is ${v.toFixed(1)} cm, correct to 1 decimal place. Write down the upper bound.`,
      a: `${dec(v + 0.05)} cm`,
      steps: [`The value is rounded to 1 decimal place, so the error is up to 0.05 cm`, `Upper bound = ${v.toFixed(1)} + 0.05 = ${dec(v + 0.05)} cm`]
    };
  });
  add('t-trans1', 'Transformations', 3, 'FH', () => {
    const x = r(-6, 6), y = r(-6, 6), a = r(-5, 5), b = r(-5, 5);
    return {
      q: `Translate the point (${x}, ${y}) by the vector (${a}, ${b}). Give the new point.`,
      a: `(${x + a}, ${y + b})`,
      steps: [`Add the vector to the point: (${x} + ${a}, ${y} + ${b})`, `New point: (${x + a}, ${y + b})`]
    };
  });
  add('t-vec1', 'Vectors', 4, 'H', () => {
    const a = r(-5, 5), b = r(-5, 5), c = r(-5, 5), d = r(-5, 5), k = r(2, 4);
    return {
      q: `Vector p = (${a}, ${b}) and vector q = (${c}, ${d}). Find ${k}p + q.`,
      a: `(${k * a + c}, ${k * b + d})`,
      steps: [`${k}p = ${k} × (${a}, ${b}) = (${k * a}, ${k * b})`, `Add q: (${k * a} + ${c}, ${k * b} + ${d}) = (${k * a + c}, ${k * b + d})`]
    };
  });
  add('t-sphere1', 'Volume', 5, 'H', () => {
    const rr = r(2, 8);
    return {
      q: `A sphere has radius ${rr} cm. Find its volume. Use π = 3.14.`,
      a: `${dec((4 / 3) * 3.14 * rr ** 3)} cm³`,
      steps: [`Volume of a sphere = 4/3 × π × radius³`, `radius³ = ${rr} × ${rr} × ${rr} = ${rr ** 3}`, `Volume = 4/3 × 3.14 × ${rr ** 3} = ${dec((4 / 3) * 3.14 * rr ** 3)} cm³`]
    };
  });
  add('t-mode1', 'Averages', 2, 'FH', () => {
    const m = r(2, 9);
    const others = [];
    while (others.length < 3) { const v = r(1, 12); if (v !== m && !others.includes(v)) others.push(v); }
    const list = [m, m, ...others].sort(() => Math.random() - 0.5);
    return {
      q: `Find the mode of ${list.join(', ')}.`,
      a: `${m}`,
      steps: [`The mode is the value that appears most often`, `${m} appears 2 times and every other value appears once`, `Mode = ${m}`]
    };
  });
  add('t-median1', 'Averages', 2, 'FH', () => {
    const n = pick([5, 7, 9]), vals = [];
    for (let i = 0; i < n; i++) vals.push(r(1, 20));
    const sorted = [...vals].sort((a, b) => a - b), mid = Math.floor(n / 2);
    return {
      q: `Find the median of ${vals.join(', ')}.`,
      a: `${sorted[mid]}`,
      steps: [`Put the values in order: ${sorted.join(', ')}`, `There are ${n} values, so the median is the ${mid + 1}th value`, `Median = ${sorted[mid]}`]
    };
  });
  add('t-range1', 'Averages', 1, 'FH', () => {
    const vals = [r(1, 10), r(1, 10), r(1, 10), r(1, 10)];
    const hi = Math.max(...vals), lo = Math.min(...vals);
    return {
      q: `Find the range of ${vals.join(', ')}.`,
      a: `${hi - lo}`,
      steps: [`Highest value: ${hi}`, `Lowest value: ${lo}`, `Range = ${hi} − ${lo} = ${hi - lo}`]
    };
  });
  add('t-venn1', 'Sets', 3, 'FH', () => {
    const a = r(5, 20), b = r(5, 20), c = r(1, Math.min(a, b));
    return {
      q: `In a class of students, ${a} study French, ${b} study Spanish and ${c} study both. How many study at least one of the two languages?`,
      a: `${a + b - c}`,
      steps: [`Add the two groups: ${a} + ${b} = ${a + b}`, `Subtract the students counted twice: ${a + b} − ${c} = ${a + b - c}`]
    };
  });
  add('t-par1', 'Angles', 2, 'FH', () => {
    const a = r(30, 150);
    return {
      q: `Two parallel lines are crossed by a transversal. Co-interior angles are ${a}° and x. Find x.`,
      a: `${180 - a}°`,
      steps: [`Co-interior angles between parallel lines add up to 180°`, `x = 180° − ${a}° = ${180 - a}°`]
    };
  });
  add('t-pie1', 'Statistics charts', 2, 'FH', () => {
    const total = pick([20, 40, 60, 80, 120]), part = r(1, total - 1);
    const angle = (part / total) * 360;
    return {
      q: `A pie chart shows ${total} people. ${part} of them chose a certain option. What is the angle of its sector?`,
      a: `${dec(angle)}°`,
      steps: [`A full circle is 360°`, `Angle = ${part} ÷ ${total} × 360° = ${dec(angle)}°`]
    };
  });
  add('t-inv1', 'Functions', 5, 'H', () => {
    const a = r(2, 5), b = r(-6, 6);
    return {
      q: `A function is f(x) = ${a}x ${signed(b)}. Find f⁻¹(x).`,
      a: `(x ${signed(-b)}) ÷ ${a}`,
      steps: [`Let y = ${a}x ${signed(b)}`, `Swap x and y: x = ${a}y ${signed(b)}`, `Rearrange: y = (x ${signed(-b)}) ÷ ${a}`]
    };
  });
  add('t-qdr1', 'Quadratics', 4, 'H', () => {
    const p = r(1, 8), q = r(1, 8);
    const b = p + q, c = p * q;
    return {
      q: `Solve x² ${signedX(b)}${signedC(c)} = 0.`,
      a: `x = ${-p} or x = ${-q}`,
      steps: [`Find two numbers that multiply to ${c} and add to ${b}`, `Those numbers are ${p} and ${q}`, `(x + ${p})(x + ${q}) = 0, so x = ${-p} or x = ${-q}`]
    };
  });

  window.Y8M_TEMPLATES = T;
})();
