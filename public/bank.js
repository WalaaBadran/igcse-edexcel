// Maths question bank (4MA1 content). Level 1 = very easy ... Level 5 = very hard.
// tier: 'F' Foundation, 'H' Higher, 'FH' both. Every question and worked answer is written for this site (AI help), not taken from past papers.
window.Y8M_BANK = [
  // Number
  { id: 'fr1', topic: 'Fractions', level: 1, tier: 'FH', q: 'Work out 1/4 + 1/4.', a: '1/2' },
  { id: 'fr2', topic: 'Fractions', level: 3, tier: 'FH', q: 'Work out 2/3 of 36.', a: '24 (36 ÷ 3 × 2)' },
  { id: 'fr3', topic: 'Fractions', level: 4, tier: 'H', q: 'Work out 2 3/4 − 1 5/6. Give your answer as a mixed number in its simplest form.', a: '11/12 (33/12 − 22/12 = 11/12)' },
  { id: 'fr4', topic: 'Fractions', level: 2, tier: 'FH', q: 'Work out 3/5 of 40.', a: '24 (40 ÷ 5 × 3)' },
  { id: 'fr5', topic: 'Fractions', level: 3, tier: 'FH', q: 'Work out 5/6 − 1/4.', a: '7/12 (10/12 − 3/12)' },
  { id: 'fr6', topic: 'Fractions', level: 5, tier: 'H', q: 'Work out 3 1/2 ÷ 1 3/4.', a: '2 (7/2 ÷ 7/4 = 7/2 × 4/7 = 2)' },

  { id: 'pc1', topic: 'Percentages', level: 1, tier: 'FH', q: 'Work out 10% of 50.', a: '5' },
  { id: 'pc2', topic: 'Percentages', level: 3, tier: 'FH', q: 'Increase 80 by 15%.', a: '92 (80 × 1.15)' },
  { id: 'pc3', topic: 'Percentages', level: 5, tier: 'H', q: 'After a 20% increase, a price is £96. What was the price before the increase?', a: '£80 (96 ÷ 1.2)' },
  { id: 'pc4', topic: 'Percentages', level: 2, tier: 'FH', q: 'Express 18 as a percentage of 60.', a: '30% (18 ÷ 60 × 100)' },
  { id: 'pc5', topic: 'Percentages', level: 4, tier: 'FH', q: 'A TV costs £350. It is reduced by 15%. What is the new price?', a: '£297.50 (350 × 0.85)' },
  { id: 'pc6', topic: 'Percentages', level: 5, tier: 'H', q: 'A population of 5000 grows by 4% each year for 3 years. Give the population after 3 years to the nearest whole number.', a: '5624 (5000 × 1.04³ = 5624.32)' },

  { id: 'rt1', topic: 'Ratio', level: 2, tier: 'FH', q: 'Share £60 in the ratio 2 : 3. How much is the smaller share?', a: '£24 (2 + 3 = 5 parts; 60 ÷ 5 = 12; 2 × 12 = 24)' },
  { id: 'rt2', topic: 'Ratio', level: 4, tier: 'FH', q: 'The ratio of boys to girls in a class is 4 : 5. There are 36 students. How many girls are there?', a: '20 (4 + 5 = 9 parts; 36 ÷ 9 = 4; 5 × 4 = 20)' },
  { id: 'rt3', topic: 'Ratio', level: 3, tier: 'FH', q: 'Divide £420 in the ratio 4 : 3.', a: '£240 and £180 (7 parts; 420 ÷ 7 = 60; 4 × 60 and 3 × 60)' },
  { id: 'rt4', topic: 'Ratio', level: 5, tier: 'H', q: 'The ratio x : y is 3 : 5 and x + y = 56. Find x.', a: '21 (3/8 of 56)' },

  { id: 'sf1', topic: 'Standard form', level: 2, tier: 'FH', q: 'Write 4 500 000 in standard form.', a: '4.5 × 10⁶' },
  { id: 'sf2', topic: 'Standard form', level: 4, tier: 'H', q: 'Work out (3 × 10⁴) × (2 × 10⁻²). Give your answer in standard form.', a: '6 × 10² (3 × 2 = 6; 10⁴ × 10⁻² = 10²)' },

  { id: 'ac1', topic: 'Bounds and accuracy', level: 2, tier: 'FH', q: 'Round 4.6782 to 2 decimal places.', a: '4.68' },
  { id: 'ac2', topic: 'Bounds and accuracy', level: 4, tier: 'H', q: 'A length is 6.4 cm, correct to 1 decimal place. Write down its lower bound.', a: '6.35 cm (half of 0.1 below 6.4)' },
  { id: 'ac3', topic: 'Bounds and accuracy', level: 5, tier: 'H', q: 'a = 5 and b = 2, both correct to the nearest whole number. Find the upper bound of a ÷ b, to 2 decimal places.', a: '3.67 (upper bound of a is 5.5 and of b is 1.5; 5.5 ÷ 1.5 = 3.67)' },

  { id: 'ix1', topic: 'Indices, HCF and LCM', level: 1, tier: 'FH', q: 'Work out 2⁵.', a: '32' },
  { id: 'ix2', topic: 'Indices, HCF and LCM', level: 3, tier: 'FH', q: 'Find the highest common factor (HCF) of 36 and 48.', a: '12' },
  { id: 'ix3', topic: 'Indices, HCF and LCM', level: 4, tier: 'H', q: 'Find the lowest common multiple (LCM) of 12 and 18.', a: '36' },
  { id: 'ix4', topic: 'Indices, HCF and LCM', level: 5, tier: 'H', q: 'Work out 8^(2/3).', a: '4 (the cube root of 8 is 2, then squared)' },

  // Algebra
  { id: 'ex1', topic: 'Expressions', level: 1, tier: 'FH', q: 'Simplify 3x + 2x.', a: '5x' },
  { id: 'ex2', topic: 'Expressions', level: 2, tier: 'FH', q: 'Expand 3(2x − 5).', a: '6x − 15' },
  { id: 'ex3', topic: 'Expressions', level: 3, tier: 'FH', q: 'Factorise 6x + 9.', a: '3(2x + 3)' },
  { id: 'ex4', topic: 'Expressions', level: 4, tier: 'H', q: 'Expand and simplify (x + 4)(x − 2).', a: 'x² + 2x − 8' },
  { id: 'ex5', topic: 'Expressions', level: 5, tier: 'H', q: 'Factorise x² − 9x + 20.', a: '(x − 4)(x − 5)' },

  { id: 'se1', topic: 'Solving equations', level: 2, tier: 'FH', q: 'Solve 2x + 3 = 11.', a: 'x = 4' },
  { id: 'se2', topic: 'Solving equations', level: 4, tier: 'H', q: 'Solve 3(x − 2) = 2x + 5.', a: 'x = 11 (3x − 6 = 2x + 5)' },
  { id: 'se3', topic: 'Solving equations', level: 3, tier: 'FH', q: 'Solve 5x − 7 = 2x + 8.', a: 'x = 5' },
  { id: 'se4', topic: 'Solving equations', level: 4, tier: 'H', q: 'Solve (x + 3)/4 = (2x − 1)/3.', a: 'x = 2.6 (3x + 9 = 8x − 4, so 5x = 13)' },
  { id: 'se5', topic: 'Solving equations', level: 5, tier: 'H', q: 'Solve x² + 5x − 6 = 0.', a: 'x = 1 or x = −6 ((x + 6)(x − 1) = 0)' },

  { id: 'sm1', topic: 'Simultaneous equations', level: 3, tier: 'H', q: 'Solve x + y = 10 and x − y = 4.', a: 'x = 7, y = 3' },
  { id: 'sm2', topic: 'Simultaneous equations', level: 5, tier: 'H', q: 'Solve 2x + 3y = 12 and 4x − y = 5.', a: 'x = 27/14 (1.93), y = 19/7 (2.71). From the second equation y = 4x − 5; substitute into the first.' },

  { id: 'in1', topic: 'Inequalities', level: 2, tier: 'FH', q: 'Solve 2x > 6.', a: 'x > 3' },
  { id: 'in2', topic: 'Inequalities', level: 4, tier: 'H', q: 'Solve 3x − 4 ≤ 11.', a: 'x ≤ 5' },
  { id: 'in3', topic: 'Inequalities', level: 5, tier: 'H', q: 'Find the integers n with −2 < 2n + 1 ≤ 7.', a: '−1, 0, 1, 2, 3 (−1.5 < n ≤ 3)' },

  { id: 'sq1', topic: 'Sequences', level: 1, tier: 'FH', q: 'Write down the next term: 2, 4, 6, 8, …', a: '10' },
  { id: 'sq2', topic: 'Sequences', level: 3, tier: 'FH', q: 'The nth term of a sequence is 3n + 2. Find the 10th term.', a: '32 (3 × 10 + 2)' },
  { id: 'sq3', topic: 'Sequences', level: 2, tier: 'FH', q: 'Find the next term: 4, 9, 14, 19, …', a: '24 (add 5 each time)' },
  { id: 'sq4', topic: 'Sequences', level: 4, tier: 'H', q: 'Find the nth term of 5, 8, 11, 14, …', a: '3n + 2' },
  { id: 'sq5', topic: 'Sequences', level: 5, tier: 'H', q: 'Find the nth term of 2, 6, 12, 20, …', a: 'n(n + 1) (the differences are 4, 6, 8, so the nth term is n² + n)' },

  { id: 'gr1', topic: 'Graphs', level: 2, tier: 'FH', q: 'Find the gradient of the line through (0, 2) and (4, 10).', a: '2 (8 ÷ 4)' },
  { id: 'gr2', topic: 'Graphs', level: 4, tier: 'H', q: 'A straight line has gradient 3 and passes through (1, 5). Find its equation.', a: 'y = 3x + 2' },
  { id: 'gr3', topic: 'Graphs', level: 5, tier: 'H', q: 'Find the point where y = 2x + 1 meets y = −x + 7.', a: '(2, 5) (2x + 1 = −x + 7, so x = 2)' },

  // Geometry
  { id: 'an1', topic: 'Angles', level: 1, tier: 'FH', q: 'Two angles on a straight line are 70° and x. Find x.', a: '110° (angles on a straight line add up to 180°)' },
  { id: 'an2', topic: 'Angles', level: 3, tier: 'FH', q: 'A triangle has angles 50° and 65°. Find the third angle.', a: '65° (180 − 50 − 65)' },
  { id: 'an3', topic: 'Angles', level: 5, tier: 'H', q: 'Work out the size of one interior angle of a regular octagon.', a: '135° (sum = (8 − 2) × 180 = 1080; 1080 ÷ 8)' },
  { id: 'an4', topic: 'Angles', level: 2, tier: 'FH', q: 'A triangle has angles 90° and 35°. Find the third angle.', a: '55° (180 − 90 − 35)' },
  { id: 'an5', topic: 'Angles', level: 4, tier: 'FH', q: 'Two parallel lines are crossed by a transversal. One alternate angle is 62°. What is the other alternate angle?', a: '62° (alternate angles are equal)' },
  { id: 'an6', topic: 'Angles', level: 5, tier: 'H', q: 'The angles of a quadrilateral are 90°, 110°, 70° and x. Find x.', a: '90° (360 − 90 − 110 − 70)' },

  { id: 'po1', topic: 'Polygons', level: 3, tier: 'FH', q: 'Find the sum of the interior angles of a pentagon.', a: '540° ((5 − 2) × 180)' },
  { id: 'po2', topic: 'Polygons', level: 4, tier: 'H', q: 'Find the size of one exterior angle of a regular decagon.', a: '36° (360 ÷ 10)' },

  { id: 'ar1', topic: 'Area and perimeter', level: 1, tier: 'FH', q: 'A rectangle is 6 cm long and 4 cm wide. Find its area.', a: '24 cm² (6 × 4)' },
  { id: 'ar2', topic: 'Area and perimeter', level: 4, tier: 'H', q: 'A shape is made from a rectangle 8 cm by 5 cm and a triangle with base 4 cm and height 3 cm joined to it. Find the total area.', a: '46 cm² (40 + 6)' },
  { id: 'ar3', topic: 'Area and perimeter', level: 3, tier: 'FH', q: 'A circle has radius 5 cm. Find its area. Use π = 3.14.', a: '78.5 cm² (3.14 × 5²)' },
  { id: 'ar4', topic: 'Area and perimeter', level: 4, tier: 'FH', q: 'A trapezium has parallel sides 6 cm and 10 cm and height 4 cm. Find its area.', a: '32 cm² (½ × (6 + 10) × 4)' },

  { id: 'ci1', topic: 'Circles', level: 5, tier: 'H', q: 'A sector has radius 9 cm and angle 80°. Find the arc length, in terms of π.', a: '4π cm (80/360 × 2π × 9)' },

  { id: 'vo1', topic: 'Volume', level: 2, tier: 'FH', q: 'Find the volume of a cuboid measuring 4 cm by 3 cm by 2 cm.', a: '24 cm³' },
  { id: 'vo2', topic: 'Volume', level: 4, tier: 'H', q: 'A cylinder has radius 3 cm and height 10 cm. Find its volume. Use π = 3.14.', a: '282.6 cm³ (3.14 × 3² × 10)' },
  { id: 'vo3', topic: 'Volume', level: 5, tier: 'H', q: 'A cone has radius 6 cm and height 8 cm. Find its volume in terms of π.', a: '96π cm³ (⅓ × π × 6² × 8)' },

  { id: 'py1', topic: 'Pythagoras and trigonometry', level: 2, tier: 'FH', q: 'A right-angled triangle has shorter sides 3 cm and 4 cm. Find the hypotenuse.', a: '5 cm (√(9 + 16))' },
  { id: 'py2', topic: 'Pythagoras and trigonometry', level: 4, tier: 'H', q: 'A right-angled triangle has hypotenuse 10 cm. The angle opposite the side x is 30°. Find x.', a: '5 cm (10 × sin 30°)' },
  { id: 'py3', topic: 'Pythagoras and trigonometry', level: 5, tier: 'H', q: 'In a right-angled triangle, the side opposite angle θ is 12 cm and the adjacent side is 5 cm. Find θ to 1 decimal place.', a: '67.4° (tan θ = 12 ÷ 5)' },

  { id: 'tr1', topic: 'Transformations', level: 2, tier: 'FH', q: 'Translate the point (2, 3) by the vector (4, −1). Give the new point.', a: '(6, 2)' },
  { id: 'tr2', topic: 'Transformations', level: 4, tier: 'H', q: 'Reflect the point (3, 2) in the x-axis. Give the new point.', a: '(3, −2)' },
  { id: 'tr3', topic: 'Transformations', level: 5, tier: 'H', q: 'Rotate the point (2, 5) by 90° clockwise about the origin. Give the new point.', a: '(5, −2) (clockwise 90° maps (x, y) to (y, −x))' },

  // Statistics and probability
  { id: 'av1', topic: 'Averages', level: 2, tier: 'FH', q: 'Find the mean of 4, 6 and 8.', a: '6 (18 ÷ 3)' },
  { id: 'av2', topic: 'Averages', level: 4, tier: 'FH', q: 'Find the median of 3, 5, 5, 7, 9, 10.', a: '6 ((5 + 7) ÷ 2)' },
  { id: 'av3', topic: 'Averages', level: 3, tier: 'FH', q: 'Find the mean of 2, 4, 6, 8 and 10.', a: '6' },
  { id: 'av4', topic: 'Averages', level: 4, tier: 'FH', q: 'Find the mode and the range of 3, 5, 5, 7, 9.', a: 'Mode 5; range 6 (9 − 3)' },
  { id: 'av5', topic: 'Averages', level: 5, tier: 'H', q: 'Five numbers have a mean of 7. Four of them add up to 24. Find the fifth number.', a: '11 (35 − 24)' },

  { id: 'st1', topic: 'Statistics charts', level: 2, tier: 'FH', q: 'A pie chart shows 40 students. One sector is 90°. How many students does it show?', a: '10 (90/360 × 40)' },

  { id: 'pr1', topic: 'Probability', level: 1, tier: 'FH', q: 'What is the probability of getting heads on a fair coin?', a: '1/2' },
  { id: 'pr2', topic: 'Probability', level: 3, tier: 'FH', q: 'A bag has 3 red and 5 blue counters. A counter is picked at random. What is the probability it is red?', a: '3/8' },
  { id: 'pr3', topic: 'Probability', level: 4, tier: 'H', q: 'Two events are independent. P(A) = 0.3 and P(B) = 0.5. Find P(A and B).', a: '0.15 (0.3 × 0.5)' },
  { id: 'pr4', topic: 'Probability', level: 5, tier: 'H', q: 'Two fair coins are tossed. What is the probability of at least one head?', a: '3/4 (1 − 1/4)' },
  { id: 'pr5', topic: 'Probability', level: 5, tier: 'H', q: 'A bag has 3 red and 2 blue counters. Two are taken out one after the other without replacement. What is the probability both are red?', a: '3/10 (3/5 × 2/4)' },
  { id: 'pr6', topic: 'Probability', level: 3, tier: 'H', q: 'Events A and B are mutually exclusive. P(A) = 0.4 and P(B) = 0.35. Find P(A or B).', a: '0.75 (0.4 + 0.35)' },
  { id: 'pr7', topic: 'Probability', level: 2, tier: 'FH', q: 'A coin is flipped 100 times and lands on heads 60 times. What is the relative frequency of heads?', a: '0.6 (60 ÷ 100)' },

  { id: 'st2', topic: 'Statistics charts', level: 4, tier: 'H', q: 'The table shows values 1, 2 and 3 with frequencies 2, 3 and 5. Find the mean.', a: '2.3 ((1×2 + 2×3 + 3×5) ÷ 10 = 23 ÷ 10)' },
  { id: 'st3', topic: 'Averages', level: 2, tier: 'FH', q: 'Find the range of 4, 9, 2 and 7.', a: '7 (9 − 2)' },

  { id: 'mo1', topic: 'Money and interest', level: 2, tier: 'FH', q: 'Work out the simple interest on £800 at 4% per year for 3 years.', a: '£96 (800 × 0.04 × 3)' },
  { id: 'mo2', topic: 'Money and interest', level: 4, tier: 'H', q: '£1000 is invested at 5% compound interest per year for 2 years. Find the total amount.', a: '£1102.50 (1000 × 1.05²)' },

  { id: 'sd1', topic: 'Speed, distance and time', level: 1, tier: 'FH', q: 'A car travels at 40 miles per hour for 3 hours. How far does it travel?', a: '120 miles (40 × 3)' },
  { id: 'sd2', topic: 'Speed, distance and time', level: 2, tier: 'FH', q: 'A car travels 150 km in 2.5 hours. What is its average speed?', a: '60 km/h (150 ÷ 2.5)' },
  { id: 'sd3', topic: 'Speed, distance and time', level: 4, tier: 'H', q: 'Change 72 km/h into metres per second.', a: '20 m/s (72 × 1000 ÷ 3600)' },
  { id: 'sd4', topic: 'Measures', level: 1, tier: 'FH', q: 'Change 3.5 m into centimetres.', a: '350 cm' },
  { id: 'sd5', topic: 'Measures', level: 2, tier: 'FH', q: 'A train leaves at 10:20 and the journey takes 2 hours 45 minutes. What time does it arrive?', a: '13:05 (10:20 + 2 h 45 min)' },
  { id: 'sd6', topic: 'Measures', level: 3, tier: 'FH', q: 'An object has a mass of 240 g and a volume of 30 cm³. Find its density.', a: '8 g/cm³ (240 ÷ 30)' },

  { id: 'in4', topic: 'Indices, HCF and LCM', level: 2, tier: 'FH', q: 'Simplify a⁵ × a³.', a: 'a⁸' },
  { id: 'in5', topic: 'Indices, HCF and LCM', level: 3, tier: 'H', q: 'Work out 4⁻².', a: '1/16' },

  { id: 'qd1', topic: 'Quadratics', level: 4, tier: 'H', q: 'Factorise x² + 2x − 15.', a: '(x + 5)(x − 3)' },
  { id: 'qd2', topic: 'Quadratics', level: 5, tier: 'H', q: 'Solve x² + 3x − 5 = 0. Give your answers to 2 decimal places.', a: 'x = 1.19 or x = −4.19 (using the quadratic formula)' },

  { id: 'cs1', topic: 'Expressions', level: 2, tier: 'FH', q: 'Simplify 2x ÷ 4.', a: 'x/2' },
  { id: 'cs2', topic: 'Expressions', level: 3, tier: 'H', q: 'Make t the subject of v = u + at.', a: 't = (v − u)/a' },
  { id: 'cs3', topic: 'Expressions', level: 5, tier: 'H', q: 'Make r the subject of A = πr².', a: 'r = √(A/π)' },

  { id: 'sq6', topic: 'Sequences', level: 4, tier: 'H', q: 'Find the nth term of 20, 17, 14, 11, …', a: '23 − 3n' },

  { id: 'fn1', topic: 'Functions', level: 2, tier: 'FH', q: 'A function is f(x) = 2x + 3. Find f(4).', a: '11 (2 × 4 + 3)' },
  { id: 'fn2', topic: 'Functions', level: 5, tier: 'H', q: 'f(x) = 2x + 3. Find the inverse function f⁻¹(x).', a: 'f⁻¹(x) = (x − 3)/2' },

  { id: 'su1', topic: 'Surds', level: 4, tier: 'H', q: 'Write √8 in its simplest form.', a: '2√2 (√4 × √2)' },
  { id: 'su2', topic: 'Surds', level: 4, tier: 'H', q: 'Work out √2 × √18.', a: '6 (√36)' },

  { id: 'be1', topic: 'Bearings', level: 2, tier: 'FH', q: 'Write the bearing of a point 60° east of north, using three figures.', a: '060' },

  { id: 'ci2', topic: 'Circles', level: 2, tier: 'FH', q: 'A circle has radius 5 cm. Find its circumference. Use π = 3.14.', a: '31.4 cm (2 × 3.14 × 5)' },
  { id: 'ci3', topic: 'Circles', level: 4, tier: 'H', q: 'The angle at the centre of a circle is 120°. Find the angle at the circumference subtended by the same arc.', a: '60° (half the angle at the centre)' },

  { id: 'po3', topic: 'Polygons', level: 5, tier: 'H', q: 'A regular polygon has an exterior angle of 24°. How many sides does it have?', a: '15 (360 ÷ 24)' },

  { id: 'sim1', topic: 'Similarity', level: 4, tier: 'H', q: 'Two similar shapes have a scale factor of 2. The small shape has an area of 10 cm². Find the area of the large shape.', a: '40 cm² (area scale factor is 2² = 4)' },

  { id: 've1', topic: 'Vectors', level: 4, tier: 'H', q: 'Vector a = (3, 2) and vector b = (1, −1). Find a + b.', a: '(4, 1)' },
  { id: 've2', topic: 'Vectors', level: 3, tier: 'H', q: 'Find the magnitude of the vector (3, 4).', a: '5 (√(9 + 16))' },

  { id: 'tr4', topic: 'Transformations', level: 3, tier: 'H', q: 'Enlarge the point (2, −1) by scale factor 3, centre the origin. Give the new point.', a: '(6, −3)' },

  { id: 'tg1', topic: 'Pythagoras and trigonometry', level: 2, tier: 'H', q: 'Find the angle x with sin x = 0.5, where 0° ≤ x ≤ 90°.', a: '30°' },
  { id: 'tg2', topic: 'Pythagoras and trigonometry', level: 3, tier: 'FH', q: 'Is a triangle with sides 6 cm, 8 cm and 10 cm right-angled? Explain.', a: 'Yes: 6² + 8² = 100 = 10², which satisfies Pythagoras\' theorem' },
  { id: 'tg3', topic: 'Pythagoras and trigonometry', level: 5, tier: 'H', q: 'In a triangle, two sides are 7 cm and 8 cm and the angle between them is 60°. Find the third side to 2 decimal places.', a: '7.55 cm (√(49 + 64 − 56))' },
  { id: 'tg4', topic: 'Pythagoras and trigonometry', level: 5, tier: 'H', q: 'Find the area of a triangle with sides 6 cm and 8 cm and the angle between them 30°.', a: '12 cm² (½ × 6 × 8 × sin 30°)' },

  { id: 'se6', topic: 'Sets', level: 3, tier: 'FH', q: 'In a group, 12 students play football, 15 play tennis and 5 play both. How many play at least one of the two sports?', a: '22 (12 + 15 − 5)' },

  { id: 'l1a', topic: 'Decimals', level: 1, tier: 'FH', q: 'Work out 0.3 + 0.45.', a: '0.75' },
  { id: 'l1b', topic: 'Decimals', level: 1, tier: 'FH', q: 'Work out 2.5 × 4.', a: '10' },
  { id: 'l1c', topic: 'Decimals', level: 1, tier: 'FH', q: 'Write 1/2 as a decimal.', a: '0.5' },
  { id: 'l1d', topic: 'Percentages', level: 1, tier: 'FH', q: 'What is 50% of 80?', a: '40' },
  { id: 'l1e', topic: 'Angles', level: 1, tier: 'FH', q: 'How many degrees is a right angle?', a: '90°' },
  { id: 'l1f', topic: 'Angles', level: 1, tier: 'FH', q: 'The angles around a point add up to how many degrees?', a: '360°' },
  { id: 'l1g', topic: 'Area and perimeter', level: 1, tier: 'FH', q: 'Find the area of a square with sides of 5 cm.', a: '25 cm² (5 × 5)' },
  { id: 'l1h', topic: 'Area and perimeter', level: 1, tier: 'FH', q: 'Find the perimeter of a rectangle that is 7 cm long and 3 cm wide.', a: '20 cm (2 × (7 + 3))' },
  { id: 'l1i', topic: 'Solving equations', level: 1, tier: 'FH', q: 'Solve x + 5 = 12.', a: 'x = 7' },
  { id: 'l1j', topic: 'Expressions', level: 1, tier: 'FH', q: 'Simplify 4a + 3a − 2a.', a: '5a' },
  { id: 'l1k', topic: 'Averages', level: 1, tier: 'FH', q: 'Find the mean of 3 and 5.', a: '4 ((3 + 5) ÷ 2)' },
  { id: 'l1l', topic: 'Probability', level: 1, tier: 'FH', q: 'What is the probability of rolling a 6 on a fair dice?', a: '1/6' },
  { id: 'l1m', topic: 'Sequences', level: 1, tier: 'FH', q: 'Write down the next term: 1, 3, 5, …', a: '7 (add 2 each time)' },
  { id: 'l1n', topic: 'Volume', level: 1, tier: 'FH', q: 'Find the volume of a cube with sides of 2 cm.', a: '8 cm³ (2 × 2 × 2)' },
  { id: 'l1o', topic: 'Ratio', level: 1, tier: 'FH', q: 'Simplify the ratio 4 : 8.', a: '1 : 2' },
  { id: 'l1p', topic: 'Graphs', level: 1, tier: 'FH', q: 'What is the x-coordinate of the point (3, 4)?', a: '3' },
  { id: 'l1q', topic: 'Measures', level: 1, tier: 'FH', q: 'How many minutes are there in 2 hours?', a: '120' },
  { id: 'l1r', topic: 'Money and interest', level: 1, tier: 'FH', q: 'Work out £5 + £2.50.', a: '£7.50' },
  { id: 'l1s', topic: 'Sets', level: 1, tier: 'FH', q: 'How many elements are in the set {2, 4, 6}?', a: '3' },
  { id: 'l1t', topic: 'Fractions', level: 1, tier: 'FH', q: 'Work out 3 × 1/5.', a: '3/5' },
  // Year 8 scheme of work: Term 1.2 (Assessment 1.2) and rounding (Term 1.1)
  { id: 'a2n1', topic: "3D shapes and nets", level: 1, tier: 'FH', q: "How many faces, edges and vertices does a cube have?", a: "6 faces, 12 edges, 8 vertices" },
  { id: 'a2n2', topic: "3D shapes and nets", level: 1, tier: 'FH', q: "A net is made of 6 identical squares. Which 3D shape does it fold into?", a: "A cube" },
  { id: 'a2n3', topic: "3D shapes and nets", level: 2, tier: 'FH', q: "A net has 2 triangles and 3 rectangles. Which 3D shape does it make?", a: "A triangular prism" },
  { id: 'a2n4', topic: "3D shapes and nets", level: 2, tier: 'FH', q: "A net has 1 square and 4 identical triangles. Which 3D shape does it make?", a: "A square-based pyramid" },
  { id: 'a2n5', topic: "3D shapes and nets", level: 3, tier: 'FH', q: "How many faces, edges and vertices does a triangular prism have?", a: "5 faces, 9 edges, 6 vertices" },
  { id: 'a2n6', topic: "3D shapes and nets", level: 3, tier: 'FH', q: "A cuboid is 5 cm by 3 cm by 2 cm. Its net is made of rectangles. What sizes are they, and how many of each?", a: "2 rectangles 5 cm × 3 cm, 2 rectangles 5 cm × 2 cm and 2 rectangles 3 cm × 2 cm" },
  { id: 'a2n7', topic: "3D shapes and nets", level: 4, tier: 'FH', q: "The net of a cylinder is a rectangle and two circles of radius 3 cm. The rectangle wraps around the circles. How long must the rectangle be? Give your answer to 1 decimal place.", a: "18.8 cm" },
  { id: 'a2s1', topic: "Surface area", level: 1, tier: 'FH', q: "Find the surface area of a cube with edges of 3 cm.", a: "54 cm²" },
  { id: 'a2s2', topic: "Surface area", level: 2, tier: 'FH', q: "Find the surface area of a cuboid 5 cm by 4 cm by 2 cm.", a: "76 cm²" },
  { id: 'a2s3', topic: "Surface area", level: 3, tier: 'FH', q: "A cuboid is 10 cm by 6 cm by 3 cm. Find its surface area.", a: "216 cm²" },
  { id: 'a2s4', topic: "Surface area", level: 3, tier: 'FH', q: "A cube has a surface area of 150 cm². Find the length of one edge.", a: "5 cm" },
  { id: 'a2s5', topic: "Surface area", level: 4, tier: 'FH', q: "An open box (no lid) is a cuboid 20 cm long, 10 cm wide and 8 cm high. Find the area of card needed to make it.", a: "680 cm²" },
  { id: 'a2s6', topic: "Surface area", level: 4, tier: 'FH', q: "A cuboid has a square base of side 4 cm and a height of h cm. Its surface area is 112 cm². Find h.", a: "h = 5" },
  { id: 'a2s7', topic: "Surface area", level: 5, tier: 'FH', q: "Find the total surface area of a closed cylinder with radius 5 cm and height 12 cm. Give your answer to 3 significant figures.", a: "534 cm²" },
  { id: 'a2c1', topic: "Circles", level: 1, tier: 'FH', q: "A circle has a diameter of 10 cm. What is its radius?", a: "5 cm" },
  { id: 'a2c2', topic: "Circles", level: 2, tier: 'FH', q: "Find the area of a circle with radius 4 cm. Give your answer to 1 decimal place.", a: "50.3 cm²" },
  { id: 'a2c3', topic: "Circles", level: 3, tier: 'FH', q: "Find the circumference of a circle with diameter 12 cm. Give your answer to 1 decimal place.", a: "37.7 cm" },
  { id: 'a2c4', topic: "Circles", level: 3, tier: 'FH', q: "A circle has a circumference of 31.4 cm. Find its radius. Use π = 3.14.", a: "5 cm" },
  { id: 'a2c5', topic: "Circles", level: 4, tier: 'FH', q: "A circle has an area of 78.5 cm². Find its radius. Use π = 3.14.", a: "5 cm" },
  { id: 'a2c6', topic: "Circles", level: 4, tier: 'FH', q: "Find the perimeter of a semicircle with diameter 10 cm. Give your answer to 1 decimal place.", a: "25.7 cm" },
  { id: 'a2c7', topic: "Circles", level: 5, tier: 'FH', q: "A circle has an area of 200 cm². Find its circumference. Give your answer to 3 significant figures.", a: "50.1 cm" },
  { id: 'a2v1', topic: "Volume", level: 3, tier: 'FH', q: "Find the volume of a cylinder with radius 2 cm and height 5 cm. Give your answer in terms of π.", a: "20π cm³" },
  { id: 'a2v2', topic: "Volume", level: 3, tier: 'FH', q: "A cylinder has radius 5 cm and height 8 cm. Find its volume to 3 significant figures.", a: "628 cm³" },
  { id: 'a2v3', topic: "Volume", level: 4, tier: 'FH', q: "A cylinder has a volume of 500 cm³ and a radius of 4 cm. Find its height to 3 significant figures.", a: "9.95 cm" },
  { id: 'a2v4', topic: "Volume", level: 5, tier: 'FH', q: "A cylinder has a height of 10 cm and a volume of 1000 cm³. Find its radius to 3 significant figures.", a: "5.64 cm" },
  { id: 'a2v5', topic: "Volume", level: 4, tier: 'FH', q: "A cylindrical water tank has a diameter of 1.2 m and a height of 2 m. How many litres does it hold? (1 m³ = 1000 litres) Give your answer to 3 significant figures.", a: "2260 litres" },
  { id: 'a2m1', topic: "Measures", level: 1, tier: 'FH', q: "Change 4.2 kg into grams.", a: "4200 g" },
  { id: 'a2m2', topic: "Measures", level: 2, tier: 'FH', q: "Change 3500 ml into litres.", a: "3.5 litres" },
  { id: 'a2m3', topic: "Measures", level: 2, tier: 'FH', q: "Change 2.5 km into metres.", a: "2500 m" },
  { id: 'a2m4', topic: "Measures", level: 3, tier: 'FH', q: "Change 3 m² into cm².", a: "30 000 cm²" },
  { id: 'a2m5', topic: "Measures", level: 3, tier: 'FH', q: "Change 45 000 cm² into m².", a: "4.5 m²" },
  { id: 'a2m6', topic: "Measures", level: 4, tier: 'FH', q: "Change 2 m³ into cm³.", a: "2 000 000 cm³" },
  { id: 'a2m7', topic: "Measures", level: 4, tier: 'FH', q: "Change 6500 mm² into cm².", a: "65 cm²" },
  { id: 'a2m8', topic: "Measures", level: 5, tier: 'FH', q: "A tank holds 0.8 m³ of water. How many litres is this? (1 litre = 1000 cm³)", a: "800 litres" },
  { id: 'a2p1', topic: "Pythagoras and trigonometry", level: 2, tier: 'FH', q: "A right-angled triangle has shorter sides 6 cm and 8 cm. Find the length of the hypotenuse.", a: "10 cm" },
  { id: 'a2p2', topic: "Pythagoras and trigonometry", level: 3, tier: 'FH', q: "A right-angled triangle has a hypotenuse of 13 cm and one shorter side of 5 cm. Find the other side.", a: "12 cm" },
  { id: 'a2p3', topic: "Pythagoras and trigonometry", level: 3, tier: 'FH', q: "A 5 m ladder leans against a wall. Its foot is 1.5 m from the wall. How high up the wall does it reach? Give your answer to 1 decimal place.", a: "4.8 m" },
  { id: 'a2p4', topic: "Pythagoras and trigonometry", level: 4, tier: 'FH', q: "Find the distance between the points (1, 2) and (7, 10).", a: "10 units" },
  { id: 'a2p5', topic: "Pythagoras and trigonometry", level: 4, tier: 'FH', q: "A rectangle is 9 cm long and its diagonal is 15 cm. Find its perimeter.", a: "42 cm" },
  { id: 'a2p6', topic: "Pythagoras and trigonometry", level: 5, tier: 'FH', q: "An isosceles triangle has two sides of 10 cm and a base of 12 cm. Find its area.", a: "48 cm²" },
  { id: 'a2pc1', topic: "Percentages", level: 2, tier: 'FH', q: "What single number do you multiply by to increase an amount by 12%?", a: "1.12" },
  { id: 'a2pc2', topic: "Percentages", level: 3, tier: 'FH', q: "Decrease £240 by 35% using a multiplier.", a: "£156" },
  { id: 'a2pc3', topic: "Percentages", level: 4, tier: 'FH', q: "In a sale with 15% off, a coat costs £68. What was its original price?", a: "£80" },
  { id: 'a2pc4', topic: "Percentages", level: 4, tier: 'FH', q: "A price rises from £40 to £46. Find the percentage increase.", a: "15%" },
  { id: 'a2i1', topic: "Money and interest", level: 3, tier: 'FH', q: "A car worth £12 000 loses 10% of its value each year. Find its value after 2 years.", a: "£9720" },
  { id: 'a2i2', topic: "Money and interest", level: 4, tier: 'FH', q: "£2500 is invested at 3% compound interest per year. Find the amount after 4 years, to the nearest penny.", a: "£2813.77" },
  { id: 'a2i3', topic: "Money and interest", level: 4, tier: 'FH', q: "A laptop bought for £900 depreciates by 20% each year. Find its value after 3 years.", a: "£460.80" },
  { id: 'a2i4', topic: "Money and interest", level: 5, tier: 'FH', q: "An investment earns 5% compound interest per year. After 2 years it is worth £1323. How much was invested?", a: "£1200" },
  { id: 'a2i5', topic: "Money and interest", level: 5, tier: 'FH', q: "£1000 is invested at 4% compound interest per year. After how many whole years will it first be worth more than £1200?", a: "5 years" },
  { id: 'a2d1', topic: "Speed, distance and time", level: 2, tier: 'FH', q: "A cyclist rides 36 km in 2 hours. Find her average speed.", a: "18 km/h" },
  { id: 'a2d2', topic: "Speed, distance and time", level: 3, tier: 'FH', q: "A train travels at 120 km/h for 45 minutes. How far does it go?", a: "90 km" },
  { id: 'a2d3', topic: "Speed, distance and time", level: 4, tier: 'FH', q: "A car travels 210 km at an average speed of 60 km/h. How long does the journey take? Give your answer in hours and minutes.", a: "3 hours 30 minutes" },
  { id: 'a2d4', topic: "Speed, distance and time", level: 5, tier: 'FH', q: "A runner covers 400 m in 50 seconds. Find her average speed in km/h.", a: "28.8 km/h" },
  { id: 'a2r1', topic: "Rounding and estimation", level: 1, tier: 'FH', q: "Round 3.476 to 1 decimal place.", a: "3.5" },
  { id: 'a2r2', topic: "Rounding and estimation", level: 2, tier: 'FH', q: "Round 0.04562 to 2 significant figures.", a: "0.046" },
  { id: 'a2r3', topic: "Rounding and estimation", level: 2, tier: 'FH', q: "Round 38 472 to 3 significant figures.", a: "38 500" },
  { id: 'a2r4', topic: "Rounding and estimation", level: 3, tier: 'FH', q: "Estimate 41.2 × 9.8 by rounding each number to 1 significant figure.", a: "400" },
  { id: 'a2r5', topic: "Rounding and estimation", level: 4, tier: 'FH', q: "Estimate the value of (6.12 × 19.7) ÷ 0.48.", a: "240" }
];
