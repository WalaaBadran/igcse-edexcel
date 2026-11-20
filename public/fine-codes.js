// 4MA1 fine learning objectives (Pearson Edexcel International GCSE Mathematics A).
// Source: Edexcel_IGCSE_Math_4MA1_Complete_Syllabus_v2 (236 objectives, canonical).
// Noted PDF discrepancy: the "Fine Objectives Sections 1-5" PDF tags 2.6B as Higher Only;
// v2, the Tracker, and Pearson's own spec mark it Both Tiers. v2 wins.
// Each row: [code, text, tier, siteTopic]
//   tier = 'B' (Both Tiers / Foundation + Higher) or 'H' (Higher Only).
//   siteTopic = the current site topic name this maps to (from topics.js), or '' if no home yet.
// DRAFT 2026-11-20 — for review before any site change. Nothing published.
window.Y9M_FINECODES = [
  // 1. Numbers and the Number System
  ['1.1A','Understand and use integers (positive, negative and zero) as positions and translations on a number line','B','Place value, ordering and negative numbers'],
  ['1.1B','Understand place value','B','Place value, ordering and negative numbers'],
  ['1.1C','Use directed numbers in practical situations','B','Place value, ordering and negative numbers'],
  ['1.1D','Order integers','B','Place value, ordering and negative numbers'],
  ['1.1E','Use the four rules of addition, subtraction, multiplication and division','B','Place value, ordering and negative numbers'],
  ['1.1F','Use brackets and the hierarchy of operations','B','Place value, ordering and negative numbers'],
  ['1.1G','Use the terms odd, even, prime numbers, factors and multiples','B','Factors, multiples, primes, HCF and LCM'],
  ['1.1H','Identify prime factors, common factors and common multiples','B','Factors, multiples, primes, HCF and LCM'],

  ['1.2A','Equivalent fractions; simplify by cancelling common factors','B','Fractions'],
  ['1.2B','Mixed numbers and vulgar fractions','B','Fractions'],
  ['1.2C','Identify common denominators','B','Fractions'],
  ['1.2D','Order fractions; fraction of a given quantity','B','Fractions'],
  ['1.2E','Express a given number as a fraction of another number','B','Fractions'],
  ['1.2F','Add and subtract fractions and mixed numbers','B','Fractions'],
  ['1.2G','Convert a fraction to a decimal or a percentage','B','Fractions, decimals and percentages'],
  ['1.2H','Unit fractions as multiplicative inverses','B','Fractions'],
  ['1.2I','Multiply and divide fractions and mixed numbers','B','Fractions'],

  ['1.3A','Use decimal notation','B','Place value, ordering and negative numbers'],
  ['1.3B','Place value in decimals','B','Place value, ordering and negative numbers'],
  ['1.3C','Order decimals','B','Place value, ordering and negative numbers'],
  ['1.3D','Convert a decimal to a fraction or a percentage','B','Fractions, decimals and percentages'],
  ['1.3E','Terminating decimal as a fraction','B','Fractions, decimals and percentages'],
  ['1.3F','Convert recurring decimals into fractions','H','Recurring decimals'],

  ['1.4A','Identify square numbers and cube numbers','B','Indices'],
  ['1.4B','Calculate squares, square roots, cubes and cube roots','B','Indices'],
  ['1.4C','Index notation and index laws for positive and negative integer powers (including zero)','B','Indices'],
  ['1.4D','Express integers as a product of powers of prime factors','B','Factors, multiples, primes, HCF and LCM'],
  ['1.4E','Find HCF and LCM','B','Factors, multiples, primes, HCF and LCM'],
  ['1.4F','Understand surds','H','Surds'],
  ['1.4G','Manipulate surds; rationalise a denominator','H','Surds'],
  ['1.4H','Index laws with integer, fractional and negative powers','H','Indices'],

  ['1.5A','Definition of a set','B',''],
  ['1.5B','Set notation: ∪, ∩, ∈, ∉','B',''],
  ['1.5C','Universal set and empty set','B',''],
  ['1.5D','Complement of a set (A\')','B',''],
  ['1.5E','Use Venn diagrams to represent sets','B',''],
  ['1.5F','Sets in algebraic terms; subsets (⊂)','H',''],
  ['1.5G','Venn diagrams and number of elements n(A)','H',''],
  ['1.5H','Notation n(A) for number of elements','H',''],
  ['1.5I','Use sets in practical situations','H',''],

  ['1.6A','Percentage means parts per 100','B','Percentages'],
  ['1.6B','Express a number as a percentage of another','B','Percentages'],
  ['1.6C','Express a percentage as a fraction and a decimal','B','Fractions, decimals and percentages'],
  ['1.6D','Multiplicative nature of percentages as operators','B','Percentages'],
  ['1.6E','Percentage increase and decrease','B','Percentages'],
  ['1.6F','Reverse percentages','B','Reverse percentages'],
  ['1.6G','Compound interest and depreciation','B','Compound interest and depreciation'],
  ['1.6H','Repeated percentage change','H','Compound interest and depreciation'],
  ['1.6I','Solve compound interest problems','H','Compound interest and depreciation'],

  ['1.7A','Ratio notation; link to fractions','B','Proportion, recipes and best buys'],
  ['1.7B','Divide a quantity in a given ratio','B','Proportion, recipes and best buys'],
  ['1.7C','Proportionality to find unknown quantities','B','Proportion, recipes and best buys'],
  ['1.7D','Direct proportion calculations','B','Proportion, recipes and best buys'],
  ['1.7E','Ratio and proportion word problems','B','Proportion, recipes and best buys'],

  ['1.8A','Round integers to a given power of 10','B','Rounding, estimation and calculators'],
  ['1.8B','Round to significant figures or decimal places','B','Rounding, estimation and calculators'],
  ['1.8C','Identify upper and lower bounds for given accuracy','B','Upper and lower bounds'],
  ['1.8D','Estimation to approximate calculations','B','Rounding, estimation and calculators'],
  ['1.8E','Solve problems using upper and lower bounds','H','Upper and lower bounds'],

  ['1.9A','Numbers in standard form a × 10^n','B','Standard form'],
  ['1.9B','Solve problems involving standard form','H','Standard form'],

  ['1.10A','Apply number in everyday life','B',''],
  ['1.10B','Calculations with mass, length, area, volume, capacity','B',''],
  ['1.10C','Time and money, including currency conversion','B',''],

  ['1.11A','Use a scientific calculator for numerical results','B','Rounding, estimation and calculators'],

  // 2. Equations, Formulae and Identities
  ['2.1A','Symbols for numbers in equations / variables in expressions','B','Simplifying and substitution'],
  ['2.1B','Algebraic expressions follow rules of arithmetic','B','Simplifying and substitution'],
  ['2.1C','Index notation for positive and negative integer powers','B','Indices'],
  ['2.1D','Index laws in simple cases','B','Indices'],
  ['2.1E','Index notation with fractional, negative and zero powers','H','Indices'],

  ['2.2A','Substitute numerical values for letters','B','Simplifying and substitution'],
  ['2.2B','Collect like terms','B','Simplifying and substitution'],
  ['2.2C','Multiply a single term over a bracket','B','Expanding and factorising'],
  ['2.2D','Take out common factors','B','Expanding and factorising'],
  ['2.2E','Expand the product of two simple linear expressions','B','Expanding and factorising'],
  ['2.2F','Factorise quadratics x² + bx + c','B','Expanding and factorising'],
  ['2.2G','Expand the product of two or more linear expressions (triple brackets)','H','Expanding and factorising'],
  ['2.2H','Factorise quadratics ax² + bx + c and difference of two squares','H','Expanding and factorising'],
  ['2.2I','Algebraic fractions (numeric, linear or quadratic)','H','Algebraic fractions'],
  ['2.2J','Complete the square','H','Completing the square'],
  ['2.2K','Use algebra to support and construct proofs','H','Algebraic proof'],

  ['2.3A','Letter as unknown number or variable','B','Simplifying and substitution'],
  ['2.3B','Notational conventions for expressions and formulae','B','Simplifying and substitution'],
  ['2.3C','Substitute integers, decimals and fractions into formulae','B','Simplifying and substitution'],
  ['2.3D','Convert real-life contexts to letters and symbols','B','Simplifying and substitution'],
  ['2.3E','Derive a formula or expression','B','Simplifying and substitution'],
  ['2.3F','Change the subject where subject appears once','B','Changing the subject'],
  ['2.3G','Change the subject where subject appears twice or involves powers/roots','H','Changing the subject'],

  ['2.4A','Solve linear equations (unknown on either/both sides, fractional coefficients)','B','Forming and solving equations'],
  ['2.4B','Set up simple linear equations from given data','B','Forming and solving equations'],

  ['2.5A','Direct and inverse proportion; relate algebraic to graphical','H','Proportion, recipes and best buys'],

  ['2.6A','Exact solution of two simultaneous equations in two unknowns','B','Simultaneous equations'],
  ['2.6B','Interpret equations as lines; common solution as intersection','H','Simultaneous equations'],

  ['2.7A','Solve quadratic equations by factorisation (Foundation: x²+bx+c only; Higher includes leading coefficient ≠ 1)','B','Quadratic equations'],
  ['2.7B','Solve by the quadratic formula or completing the square','H','Quadratic equations'],
  ['2.7C','Form and solve quadratic equations from a context','H','Quadratic equations'],
  ['2.7D','Simultaneous equations: one linear, one quadratic','H','Simultaneous equations'],

  ['2.8A','Symbols >, <, ≥, ≤','B','Inequalities'],
  ['2.8B','Open and closed intervals on a number line','B','Inequalities'],
  ['2.8C','Solve simple linear inequalities; number line','B','Inequalities'],
  ['2.8D','Represent linear inequalities on Cartesian graphs','B','Inequalities'],
  ['2.8E','Identify regions on graphs from linear inequalities','B','Inequalities'],
  ['2.8F','Solve quadratic inequalities','H','Inequalities'],
  ['2.8G','Harder regions defined by linear inequalities','H','Inequalities'],

  // 3. Sequences, Functions and Graphs
  ['3.1A','Terms of a sequence from term-to-term and position-to-term rules','B','Sequences and nth term'],
  ['3.1B','Find next terms and the rule for an integer sequence','B','Sequences and nth term'],
  ['3.1C','nth term of arithmetic sequences','B','Sequences and nth term'],
  ['3.1D','Common difference d and first term a','H','Sequences and nth term'],
  ['3.1E','nth term = a + (n − 1)d','H','Sequences and nth term'],
  ['3.1F','Sum of first n terms of an arithmetic series (Sn)','H','Arithmetic series'],

  ['3.2A','Function as mapping between two sets','H',''],
  ['3.2B','Function notation f(x) = …, f : x ↦ …','H',''],
  ['3.2C','Domain and range; excluded values','H',''],
  ['3.2D','Composite fg and inverse f⁻¹','H',''],

  ['3.3A','Interpret linear and non-linear graphs','B','Straight-line graphs'],
  ['3.3B','Rectangular Cartesian coordinates','B','Coordinates, midpoints and lengths'],
  ['3.3C','Plot points in four quadrants','B','Coordinates, midpoints and lengths'],
  ['3.3D','Coordinates from geometrical information','B','Coordinates, midpoints and lengths'],
  ['3.3E','Midpoint of a line segment','B','Coordinates, midpoints and lengths'],
  ['3.3F','Straight-line conversion graphs','B','Straight-line graphs'],
  ['3.3G','Gradient of a straight line','B','Straight-line graphs'],
  ['3.3H','y = mx + c: gradient m, intercept (0, c)','B','Straight-line graphs'],
  ['3.3I','Plot graphs of linear and quadratic functions','B','Straight-line graphs'],
  ['3.3J','Plot cubic and reciprocal graphs','H','Graphs of curves and transformations'],
  ['3.3K','Graph transformations f(x)+a, f(ax), f(x+a), af(x)','H','Graphs of curves and transformations'],
  ['3.3L','Interpret transformations; write algebraically','H','Graphs of curves and transformations'],
  ['3.3M','Gradients of non-linear graphs by tangent','H','Graphs of curves and transformations'],
  ['3.3N','Intersections of two graphs (linear and non-linear)','H','Graphs of curves and transformations'],
  ['3.3O','Gradient from two points','H','Straight-line graphs'],
  ['3.3P','Equation of parallel/perpendicular line','H','Straight-line graphs'],
  ['3.3Q','Recognise, plot and draw y = sin x, y = cos x, y = tan x (angles in degrees)','H','Graphs of curves and transformations'],

  ['3.4A','Variable rate of change','H',''],
  ['3.4B','Differentiate integer powers of x','H',''],
  ['3.4C','Stationary / turning points by differentiation','H',''],
  ['3.4D','Maxima vs minima from graph shape','H',''],
  ['3.4E','Calculus for linear kinematics and simple problems','H',''],

  // 4. Geometry and Trigonometry
  ['4.1A','Acute, obtuse, reflex and right angles','B','Angles and parallel lines'],
  ['4.1B','Angles on intersecting/parallel lines; angles on a straight line','B','Angles and parallel lines'],
  ['4.1C','Exterior and interior angles of a triangle','B','Angles and parallel lines'],
  ['4.1D','Isosceles, equilateral, right-angled triangles and their angle properties','B','Angles and parallel lines'],

  ['4.2A','Name polygons','B','Angles in polygons'],
  ['4.2B','Quadrilateral and angle sum property','B','Angles in polygons'],
  ['4.2C','Properties of parallelogram, rectangle, square, rhombus, trapezium, kite','B','Angles in polygons'],
  ['4.2D','Regular polygons; interior and exterior angles','B','Angles in polygons'],
  ['4.2E','Angle sum of polygons','B','Angles in polygons'],
  ['4.2F','Congruence as same shape and size','B','Angles in polygons'],
  ['4.2G','Two or more polygons congruent','B','Angles in polygons'],

  ['4.3A','Lines of symmetry and order of rotational symmetry','B',''],

  ['4.4A','Interpret scales on measuring instruments','B',''],
  ['4.4B','24-hour and 12-hour time intervals','B',''],
  ['4.4C','Sensible estimates for a range of measures','B',''],
  ['4.4D','Angle measure including three-figure bearings','B',''],
  ['4.4E','Measure angles to the nearest degree','B',''],
  ['4.4F','Relationship between average speed, distance and time','B','Proportion, recipes and best buys'],
  ['4.4G','Compound measure: speed, density, pressure','B','Proportion, recipes and best buys'],

  ['4.5A','Measure and draw lines to the nearest millimetre','B',''],
  ['4.5B','Construct triangles using ruler, protractor, compasses','B',''],
  ['4.5C','Scale drawings','B',''],
  ['4.5D','Perpendicular bisector and angle bisector (compass construction)','B',''],

  ['4.6A','Circle terms: centre, radius, chord, diameter, circumference, tangent, arc, sector, segment','B','Circles: area and circumference'],
  ['4.6B','Chord and tangent properties of circles','B','Circles: area and circumference'],
  ['4.6C','Internal and external intersecting chord properties','H','Circle theorems'],
  ['4.6D','Cyclic quadrilateral','H','Circle theorems'],
  ['4.6E','Circle angle properties and alternate segment theorem','H','Circle theorems'],

  ['4.7A','Informal reasons for geometrical solutions','B','Angles and parallel lines'],
  ['4.7B','Formal reasons using standard geometrical statements','H','Angles and parallel lines'],

  ['4.8A','Pythagoras in 2D','B','Pythagoras'],
  ['4.8B','Sine, cosine, tangent for right-angled triangles','B','Right-angled trigonometry'],
  ['4.8C','Trigonometry in 2D problems','B','Right-angled trigonometry'],
  ['4.8D','Sine, cosine, tangent of obtuse angles','H','Right-angled trigonometry'],
  ['4.8E','Angles of elevation and depression','H','Right-angled trigonometry'],
  ['4.8F','Sine rule and cosine rule','H','Sine and cosine rules'],
  ['4.8G','Pythagoras in 3D','H','3D trigonometry and Pythagoras'],
  ['4.8H','Area of a triangle ½ab sin C','H','Sine and cosine rules'],
  ['4.8I','Trigonometry in 3D; angle between line and plane','H','3D trigonometry and Pythagoras'],

  ['4.9A','Convert metric measurements (linear and area)','B','Area and perimeter'],
  ['4.9B','Perimeter of shapes from triangles and rectangles','B','Area and perimeter'],
  ['4.9C','Area using triangle and rectangle formulae','B','Area and perimeter'],
  ['4.9D','Area of parallelograms and trapezia','B','Area and perimeter'],
  ['4.9E','Circumference and area of circles; semicircles','B','Circles: area and circumference'],
  ['4.9F','Perimeter and area of sectors of circles','H','Arcs and sectors'],

  ['4.10A','Name 3D solids','B','Volume and surface area (prisms and cylinders)'],
  ['4.10B','Face, edge, vertex','B','Volume and surface area (prisms and cylinders)'],
  ['4.10C','Surface area using triangle and rectangle formulae','B','Volume and surface area (prisms and cylinders)'],
  ['4.10D','Surface area of a cylinder','B','Volume and surface area (prisms and cylinders)'],
  ['4.10E','Volume of prisms, cuboids, cylinders','B','Volume and surface area (prisms and cylinders)'],
  ['4.10F','Convert units of volume','B','Volume and surface area (prisms and cylinders)'],
  ['4.10G','Surface area and volume of sphere and right circular cone','H','Volume and surface area (prisms and cylinders)'],

  ['4.11A','Similar figures: corresponding lengths in same ratio','B','Similar shapes'],
  ['4.11B','Maps and scale drawings','B','Similar shapes'],
  ['4.11C','Area scale factor k²','H','Similar shapes'],
  ['4.11D','Volume scale factor k³','H','Similar shapes'],
  ['4.11E','Areas and volumes of similar figures in problems','H','Similar shapes'],

  // 5. Vectors and Transformation Geometry
  ['5.1A','Vectors have magnitude and direction','H',''],
  ['5.1B','Vector notation including column vectors','H',''],
  ['5.1C','Multiply vectors by scalars','H',''],
  ['5.1D','Add and subtract vectors','H',''],
  ['5.1E','Modulus (magnitude) of a vector','H',''],
  ['5.1F','Resultant of two or more vectors','H',''],
  ['5.1G','Vector methods for simple geometrical proofs','H',''],

  ['5.2A','Rotation: centre and angle','B',''],
  ['5.2B','Rotate a shape about a point','B',''],
  ['5.2C','Anti-clockwise = positive, clockwise = negative','B',''],
  ['5.2D','Reflection: mirror line','B',''],
  ['5.2E','Construct a mirror line; reflect a shape','B',''],
  ['5.2F','Translation: distance and direction','B',''],
  ['5.2G','Translate a shape','B',''],
  ['5.2H','Column vectors for translations','B',''],
  ['5.2I','Rotation, reflection, translation preserve length and angle','B',''],
  ['5.2J','Enlargement: centre and scale factor','B',''],
  ['5.2K','Enlargement preserves angles, not lengths','B',''],
  ['5.2L','Enlarge a shape (positive scale factors incl. fractional; negative enlargement is enrichment, not specification)','B',''],
  ['5.2M','Identify and describe transformations','B',''],

  // 6. Statistics and Probability
  ['6.1A','Pictograms, bar charts, pie charts, two-way tables','B','Averages and range'],
  ['6.1B','Tabulation methods for statistical diagrams','B','Averages and range'],
  ['6.1C','Interpret statistical diagrams','B','Averages and range'],
  ['6.1D','Histograms with unequal class widths','H','Histograms'],
  ['6.1E','Construct cumulative-frequency diagrams from tables','H','Cumulative frequency and quartiles'],
  ['6.1F','Use cumulative-frequency diagrams','H','Cumulative frequency and quartiles'],

  ['6.2A','Concept of average','B','Averages and range'],
  ['6.2B','Mean, median, mode, range (discrete)','B','Averages and range'],
  ['6.2C','Estimate mean for grouped data','B','Averages from grouped data'],
  ['6.2D','Modal class for grouped data','B','Averages from grouped data'],
  ['6.2E','Cumulative frequency diagrams','H','Cumulative frequency and quartiles'],
  ['6.2F','Estimate median from a cumulative-frequency diagram','H','Cumulative frequency and quartiles'],
  ['6.2G','IQR for a discrete data set','H','Cumulative frequency and quartiles'],
  ['6.2H','Estimate IQR from a cumulative-frequency diagram','H','Cumulative frequency and quartiles'],
  ['6.2I','Concept of a measure of spread','H','Cumulative frequency and quartiles'],

  ['6.3A','Language of probability','B',''],
  ['6.3B','Probability scale 0 to 1','B',''],
  ['6.3C','Theoretical probability (equally likely outcomes)','B',''],
  ['6.3D','Probabilities from a Venn diagram','B',''],
  ['6.3E','Sample space; event; probability from sample space','B',''],
  ['6.3F','List outcomes for one and two successive events','B',''],
  ['6.3G','Experimental probability (relative frequency)','B',''],
  ['6.3H','Complement: P(A\') = 1 − P(A)','B',''],
  ['6.3I','Addition rule for mutually exclusive events','B',''],
  ['6.3J','Expected frequency = trials × probability','B',''],
  ['6.3K','Tree diagrams (with and without replacement)','H','Combined events and tree diagrams'],
  ['6.3L','P(A and B) = P(A) × P(B) for independent events','H','Combined events and tree diagrams'],
  ['6.3M','Conditional probability','H','Combined events and tree diagrams'],
  ['6.3N','Multi-step or algebraic probability problems','H','Combined events and tree diagrams']
];
// Helper: lookup by site-topic name (used by cheats.js to show chips).
window.Y9M_finesFor = function (topicName) {
  const t = String(topicName || '').toLowerCase();
  return (window.Y9M_FINECODES || []).filter(r => r[3] && r[3].toLowerCase() === t);
};
