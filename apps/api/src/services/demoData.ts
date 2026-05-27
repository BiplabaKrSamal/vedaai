import type { GeneratedPaper, GeneratedQuestion, GeneratedSection, QuestionType, Difficulty } from '@vedaai/shared';
import { v4 as uuid } from 'uuid';

// ─── Rich question banks per subject ─────────────────────────────────────────

const QUESTION_BANKS: Record<string, Record<QuestionType, string[]>> = {
  biology: {
    mcq: [
      "Which organelle is known as the 'powerhouse of the cell'?",
      "What process do plants use to convert sunlight into chemical energy?",
      "Which molecule carries genetic information in most living organisms?",
      "What is the primary function of red blood cells?",
      "Which process results in the formation of two genetically identical daughter cells?",
      "What is the basic unit of heredity?",
      "Which part of the cell controls what enters and exits?",
      "What is the role of ribosomes in a cell?",
    ],
    short_answer: [
      "Explain the difference between mitosis and meiosis.",
      "Describe the structure and function of the cell membrane.",
      "What is the significance of the Calvin cycle in photosynthesis?",
      "Explain how enzymes function as biological catalysts.",
      "Describe the process of osmosis and give an example.",
    ],
    long_answer: [
      "Describe the complete process of cellular respiration, including glycolysis, the Krebs cycle, and oxidative phosphorylation.",
      "Explain the central dogma of molecular biology, describing the processes of transcription and translation in detail.",
      "Discuss how natural selection leads to evolution. Provide examples of adaptations in organisms.",
    ],
    true_false: [
      "All living organisms are made up of cells.",
      "DNA is found only in the nucleus of the cell.",
      "Photosynthesis releases carbon dioxide into the atmosphere.",
      "Enzymes are consumed during chemical reactions.",
      "All mutations in DNA lead to genetic disorders.",
    ],
    fill_blanks: [
      "The process by which plants make food using sunlight is called _________.",
      "The ___________ is the control center of the cell.",
      "DNA stands for ___________ Acid.",
      "The stage of mitosis where chromosomes line up in the middle is called ___________.",
    ],
  },
  mathematics: {
    mcq: [
      "What is the derivative of f(x) = x³ + 2x?",
      "Which of the following is a prime number?",
      "What is the value of sin(90°)?",
      "If a triangle has angles 45°, 45°, and 90°, what type of triangle is it?",
      "What is the solution to the equation 2x + 5 = 13?",
      "What is the area of a circle with radius 7 cm?",
      "Which property states that a(b + c) = ab + ac?",
      "What is the value of log₁₀(1000)?",
    ],
    short_answer: [
      "Solve the quadratic equation x² - 5x + 6 = 0 and explain the method used.",
      "Find the derivative of f(x) = 3x⁴ - 2x² + 7x - 1.",
      "Prove that the sum of angles in a triangle equals 180°.",
      "Calculate the definite integral of f(x) = 2x from x = 0 to x = 4.",
      "Explain the concept of a function and give three real-world examples.",
    ],
    long_answer: [
      "Explain the concept of limits in calculus and how they form the foundation of derivatives and integrals. Provide worked examples.",
      "Discuss the applications of matrices in solving systems of linear equations. Solve a 3×3 system using Gaussian elimination.",
      "Describe the relationship between exponential and logarithmic functions. Explain their properties and real-world applications.",
    ],
    true_false: [
      "Every integer is a rational number.",
      "The square root of a negative number is always undefined in real numbers.",
      "A matrix multiplied by its inverse always gives the identity matrix.",
      "All quadratic equations have two distinct real roots.",
      "The derivative of a constant function is zero.",
    ],
    fill_blanks: [
      "The formula for the area of a triangle is ___________.",
      "The Pythagorean theorem states that a² + b² = ___________.",
      "The derivative of sin(x) is ___________.",
      "A polynomial of degree 3 is called a ___________.",
    ],
  },
  history: {
    mcq: [
      "In which year did World War II end?",
      "Who was the first President of the United States?",
      "Which empire was ruled by Julius Caesar?",
      "What event triggered the start of World War I?",
      "Which revolution took place in France in 1789?",
      "Who wrote the Declaration of Independence?",
      "Which civilization built the pyramids at Giza?",
      "What was the name of the economic policy in the Soviet Union under Stalin?",
    ],
    short_answer: [
      "Explain the causes and consequences of the French Revolution.",
      "Describe the significance of the Magna Carta in the development of democracy.",
      "What were the main causes of World War I?",
      "Describe the impact of the Industrial Revolution on society.",
      "Explain the significance of the Renaissance period in European history.",
    ],
    long_answer: [
      "Analyze the causes, major events, and consequences of World War II. How did the war reshape the global political order?",
      "Discuss the rise and fall of the Roman Empire. What factors contributed to its eventual collapse?",
      "Describe the causes and effects of the Cold War. How did it influence global politics in the 20th century?",
    ],
    true_false: [
      "The American Civil War ended in 1865.",
      "Napoleon Bonaparte was born in France.",
      "The Berlin Wall fell in 1991.",
      "Gandhi was the first Prime Minister of independent India.",
      "The Renaissance began in Italy.",
    ],
    fill_blanks: [
      "The first atomic bomb was dropped on the city of ___________ in 1945.",
      "The ___________ was a major economic crisis that began in 1929.",
      "The French national motto is 'Liberty, Equality, ___________'.",
      "The first man to walk on the moon was ___________.",
    ],
  },
  physics: {
    mcq: [
      "What is the SI unit of force?",
      "Which law states that for every action there is an equal and opposite reaction?",
      "What is the speed of light in a vacuum?",
      "Which type of energy does a moving object possess?",
      "What is the formula for calculating work done?",
      "Which particle carries a negative electric charge?",
      "What phenomenon occurs when light bends as it passes from one medium to another?",
      "What is the unit of electrical resistance?",
    ],
    short_answer: [
      "Explain Newton's three laws of motion with examples.",
      "What is the difference between speed and velocity? Give examples.",
      "Describe the photoelectric effect and its significance.",
      "Explain the principle of conservation of energy.",
      "What is Ohm's Law? Write the formula and explain each term.",
    ],
    long_answer: [
      "Explain the theory of special relativity proposed by Einstein. Discuss its key postulates and implications.",
      "Describe the structure of the atom according to quantum mechanical model. How does it differ from Bohr's model?",
      "Discuss the principles of thermodynamics and their applications in real-world systems.",
    ],
    true_false: [
      "Sound can travel through a vacuum.",
      "The gravitational force between two objects increases as their distance increases.",
      "All electromagnetic waves travel at the same speed in a vacuum.",
      "A transformer can work on DC current.",
      "Velocity is a scalar quantity.",
    ],
    fill_blanks: [
      "The formula for kinetic energy is ___________ = ½mv².",
      "The acceleration due to gravity on Earth is approximately ___________ m/s².",
      "Ohm's Law states that V = ___________.",
      "The unit of power is ___________ (Watt).",
    ],
  },
  chemistry: {
    mcq: [
      "What is the chemical symbol for Gold?",
      "Which gas is produced when an acid reacts with a carbonate?",
      "What is the pH of a neutral solution at 25°C?",
      "Which element has the highest electronegativity?",
      "What type of bond is formed by sharing electrons?",
      "What is the molecular formula of glucose?",
      "Which law states that gases at constant temperature have pressure inversely proportional to volume?",
      "What is the oxidation state of oxygen in most compounds?",
    ],
    short_answer: [
      "Explain the difference between ionic and covalent bonds with examples.",
      "Describe the process of electrolysis with a practical application.",
      "What is Le Chatelier's principle? Give an example of its application.",
      "Explain the concept of pH and how it relates to acidity and basicity.",
      "Describe the structure of benzene and explain its stability.",
    ],
    long_answer: [
      "Explain the periodic table's organization and how periodic trends such as atomic radius, ionization energy, and electronegativity vary across periods and groups.",
      "Discuss the mechanisms of organic reactions, focusing on substitution and elimination reactions. Provide examples for each.",
      "Describe the principles of chemical equilibrium and factors that affect it. Derive the equilibrium constant expression for a general reaction.",
    ],
    true_false: [
      "All acids contain hydrogen.",
      "The number of protons in an atom determines its atomic number.",
      "Isotopes of an element have the same number of neutrons.",
      "Organic compounds always contain carbon.",
      "Exothermic reactions always occur spontaneously.",
    ],
    fill_blanks: [
      "The process of a liquid turning into gas below its boiling point is called ___________.",
      "The number of atoms in one mole of substance is ___________ × 10²³.",
      "An atom that has gained or lost electrons is called an ___________.",
      "The formula for sulfuric acid is ___________.",
    ],
  },
};

// ─── MCQ option generators ────────────────────────────────────────────────────

const MCQ_OPTIONS: Record<string, string[][]> = {
  "Which organelle is known as the 'powerhouse of the cell'?": [
    ['A. Nucleus', 'B. Mitochondria', 'C. Ribosome', 'D. Golgi apparatus'],
  ],
  "What is the SI unit of force?": [
    ['A. Joule', 'B. Watt', 'C. Newton', 'D. Pascal'],
  ],
  "What is the speed of light in a vacuum?": [
    ['A. 3 × 10⁶ m/s', 'B. 3 × 10⁸ m/s', 'C. 3 × 10¹⁰ m/s', 'D. 3 × 10⁴ m/s'],
  ],
};

function getOptions(questionText: string, index: number): string[] {
  if (MCQ_OPTIONS[questionText]) return MCQ_OPTIONS[questionText][0];
  // Generic options for any MCQ
  const optSets = [
    ['A. Option Alpha', 'B. Option Beta', 'C. Option Gamma', 'D. Option Delta'],
    ['A. First choice', 'B. Second choice', 'C. Third choice', 'D. Fourth choice'],
    ['A. Answer A', 'B. Answer B', 'C. Answer C', 'D. Answer D'],
  ];
  return optSets[index % optSets.length];
}

// ─── Main demo generator ──────────────────────────────────────────────────────

function detectSubjectKey(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes('bio')) return 'biology';
  if (s.includes('math') || s.includes('calculus') || s.includes('algebra')) return 'mathematics';
  if (s.includes('hist') || s.includes('social')) return 'history';
  if (s.includes('phys')) return 'physics';
  if (s.includes('chem')) return 'chemistry';
  // Default to biology if unknown
  return 'biology';
}

export function generateDemoPaper(
  assignmentId: string,
  input: import('@vedaai/shared').AssignmentInput
): GeneratedPaper {
  const subjectKey = detectSubjectKey(input.subject);
  const bank = QUESTION_BANKS[subjectKey] ?? QUESTION_BANKS['biology'];

  const difficultyMap: Record<string, Difficulty[]> = {
    easy:   ['easy', 'easy', 'medium'],
    medium: ['easy', 'medium', 'hard'],
    hard:   ['medium', 'hard', 'hard'],
  };
  const diffPool = difficultyMap[input.difficulty] ?? difficultyMap['medium'];

  const sections: GeneratedSection[] = input.questionTypes.map((qtConfig, si) => {
    const { type, count, marksPerQuestion } = qtConfig;
    const pool: string[] = [...(bank[type] ?? bank['short_answer'])];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const questions: GeneratedQuestion[] = Array.from({ length: count }, (_, qi) => {
      const text = pool[qi % pool.length];
      const difficulty: Difficulty = diffPool[(si + qi) % diffPool.length];
      const q: GeneratedQuestion = {
        id: `q-${si}-${qi}-${uuid().slice(0, 8)}`,
        text,
        type,
        difficulty,
        marks: marksPerQuestion,
      };
      if (type === 'mcq') {
        q.options = getOptions(text, qi);
      }
      return q;
    });

    const sectionLetters = ['A', 'B', 'C', 'D', 'E'];
    const typeInstructions: Record<QuestionType, string> = {
      mcq:          'Choose the correct answer from the options given.',
      short_answer: 'Answer in 2–3 sentences.',
      long_answer:  'Answer in detail. Marks are awarded for structure and accuracy.',
      true_false:   'Write True or False for each statement.',
      fill_blanks:  'Fill in each blank with the correct word or phrase.',
    };

    return {
      id: `sec-${si}-${uuid().slice(0, 8)}`,
      title: `Section ${sectionLetters[si] ?? String(si + 1)}`,
      instruction: typeInstructions[type] ?? 'Attempt all questions.',
      questions,
      totalMarks: count * marksPerQuestion,
    };
  });

  const durationMap: Record<string, string> = {
    easy: '1 Hour', medium: '1.5 Hours', hard: '2 Hours',
  };

  return {
    id: uuid(),
    assignmentId,
    title: input.title,
    subject: input.subject,
    grade: input.grade,
    totalMarks: sections.reduce((t, s) => t + s.totalMarks, 0),
    duration: durationMap[input.difficulty] ?? '1.5 Hours',
    sections,
    generatedAt: new Date().toISOString(),
  };
}
