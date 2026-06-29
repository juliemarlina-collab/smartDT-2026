/* Smart DT Project — Quiz Data
   window.SMARTDT_QUIZ[phaseNum] = array of 5 question objects
   Each: { q: string, a: 0-3 (correct index), o: [4 options], e: explanation }
*/
window.SMARTDT_QUIZ = {
  1: [
    {
      q: 'What is the main goal of the Empathise phase?',
      a: 1,
      o: ['Build a prototype quickly', 'Understand the user deeply before solving', 'Select the best idea', 'Write a problem statement'],
      e: 'Empathise is about gaining deep insight into user needs, feelings, and context BEFORE defining any problem or solution.'
    },
    {
      q: 'Which method is best for collecting real user evidence?',
      a: 2,
      o: ['Guessing what users need', 'Reading only online articles', 'Observing and interviewing real users', 'Asking your teammates'],
      e: 'Real evidence comes from direct observation and interviews with actual target users — not assumptions or secondary sources.'
    },
    {
      q: 'An Empathy Map organises evidence into:',
      a: 0,
      o: ['Says, Thinks, Does, Feels', 'Problem, Solution, Prototype, Test', 'Who, What, Where, Why', 'Input, Process, Output, Outcome'],
      e: 'The four quadrants of an Empathy Map are Says, Thinks, Does, and Feels — capturing the full human picture.'
    },
    {
      q: 'What should you avoid when interviewing users?',
      a: 3,
      o: ['Using open-ended questions', 'Following up with "Why?"', 'Recording observations', 'Asking leading yes/no questions'],
      e: 'Leading or yes/no questions push users toward your assumptions. Open questions invite honest stories and real feelings.'
    },
    {
      q: 'POEMS stands for:',
      a: 1,
      o: ['People, Objectives, Evidence, Methods, Strategy', 'People, Objects, Environments, Messages, Services', 'Problems, Outcomes, Empathy, Methods, Solutions', 'Process, Objects, Empathy, Maps, Systems'],
      e: 'POEMS is an observation framework: People, Objects, Environments, Messages, Services — used to capture a real situation.'
    }
  ],
  2: [
    {
      q: 'What is the correct format for a Needs Statement?',
      a: 2,
      o: ['We will build an app to solve the problem', 'The problem is that students struggle', '[User] needs a way to [need] because [insight]', 'Our solution is a website with features'],
      e: 'The Needs Statement follows: [User] needs a way to [need] because [insight]. It focuses on the need, not the solution.'
    },
    {
      q: 'A User Persona is based on:',
      a: 1,
      o: ['Team imagination and creativity', 'Real interview and observation findings', 'Online statistics only', 'The teacher\'s suggestions'],
      e: 'A persona must be grounded in real evidence from interviews and observations — not invented assumptions.'
    },
    {
      q: 'The Define phase turns research into:',
      a: 0,
      o: ['A clear, focused user need', 'A working prototype', 'A list of solutions', 'A completed quiz'],
      e: 'Define synthesises Empathy findings into one clear user need and insight — the foundation for ideation.'
    },
    {
      q: 'Which of these is a good insight in a Needs Statement?',
      a: 3,
      o: ['Because we want to help', 'Because technology is useful', 'Because students are lazy', 'Because they fear making mistakes in an unfamiliar process'],
      e: 'A good insight explains the underlying motivation, fear, or challenge — specific and evidence-based.'
    },
    {
      q: 'What does a User Persona help the team do?',
      a: 2,
      o: ['Write code faster', 'Decide on the budget', 'Design for a realistic human, not an abstract group', 'Choose a project topic'],
      e: 'Personas make the target user concrete and human, so the team designs solutions that match real needs and contexts.'
    }
  ],
  3: [
    {
      q: 'The first rule of brainstorming is:',
      a: 0,
      o: ['Generate many ideas without judging them', 'Choose the best idea immediately', 'Only share safe, proven ideas', 'Work alone to avoid conflict'],
      e: 'In brainstorming, quantity beats quality first. Defer judgement — all ideas are welcome before any are filtered.'
    },
    {
      q: 'What does the "S" in SCAMPER stand for?',
      a: 1,
      o: ['Solve', 'Substitute', 'Survey', 'Select'],
      e: 'SCAMPER: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse — a creative improvement technique.'
    },
    {
      q: 'A How Might We (HMW) question should be:',
      a: 2,
      o: ['Very specific with a named solution', 'Too broad to answer', 'Open-ended and user-centred', 'A yes/no question'],
      e: 'Good HMW questions are open enough to invite many ideas but focused enough on the user need to guide direction.'
    },
    {
      q: 'The Idea Prioritisation Matrix helps teams:',
      a: 3,
      o: ['Write the problem statement', 'Build a prototype', 'Design the app interface', 'Compare ideas using clear criteria before selecting'],
      e: 'The matrix scores ideas on impact, feasibility, sustainability, and user value — removing bias from the selection process.'
    },
    {
      q: 'After ideation, the team should:',
      a: 0,
      o: ['Select one strong idea using criteria and move to prototyping', 'Present all ideas to the teacher', 'Delete weak ideas immediately', 'Start building the final product'],
      e: 'One idea should be selected using structured criteria, then carried forward into a tangible prototype.'
    }
  ],
  4: [
    {
      q: 'What is a low-fidelity prototype?',
      a: 1,
      o: ['A finished digital product', 'A rough, quick version made to learn and test fast', 'A detailed 3D model', 'The final submission'],
      e: 'Low-fidelity means simple and fast — sketches, paper models, storyboards. The goal is learning, not perfection.'
    },
    {
      q: 'The Prototype phase goal is:',
      a: 2,
      o: ['To finish the project', 'To impress the teacher', 'To make the idea tangible so it can be tested and improved', 'To create a logo'],
      e: 'Prototypes exist to learn — they make abstract ideas real enough to get real feedback from users.'
    },
    {
      q: 'Which of these is NOT a prototype format?',
      a: 3,
      o: ['Paper sketch', 'Storyboard', 'Clickable wireframe', 'Final published website'],
      e: 'A final published website is a finished product, not a prototype. Prototypes are quick and designed to be changed.'
    },
    {
      q: 'A good Prototype Direction Plan includes:',
      a: 0,
      o: ['Concept, format, user, features, materials, task distribution, success check', 'Only the team name and topic', 'A list of problems', 'Quiz scores and template names'],
      e: 'T11 covers all key planning elements: what you\'re building, how, for whom, what it must show, and who does what.'
    },
    {
      q: 'Why is it important to document versions?',
      a: 1,
      o: ['To fill in the template only', 'To show how user feedback shaped improvements over time', 'To prove the team worked a long time', 'Because the teacher requires it'],
      e: 'Version logs show the Design Thinking process — each version should link to specific feedback and decisions made.'
    }
  ],
  5: [
    {
      q: 'When testing a prototype, you should first:',
      a: 2,
      o: ['Explain how it works in detail', 'Ask users to guess what it does', 'Observe silently as the user interacts', 'Show the final product instead'],
      e: 'Silent observation reveals what users actually understand and struggle with — more honest than guided tours.'
    },
    {
      q: 'A Feedback Grid organises feedback into:',
      a: 0,
      o: ['What worked, what to improve, questions raised, action items', 'Good, bad, neutral, irrelevant', 'User, need, insight, evidence', 'Phase 1, 2, 3, 4'],
      e: 'T12 uses four quadrants: What Worked, What Could Improve, Questions Raised, Action Items — for structured reflection.'
    },
    {
      q: 'How many users should you ideally test with?',
      a: 1,
      o: ['1 — your best friend', 'At least 3 real target users', '10 or more online respondents', 'Only the teacher'],
      e: 'At least 3 users helps identify patterns. Online-only surveys miss the rich observation data from in-person testing.'
    },
    {
      q: 'A good 8-Slide Pitch structure ends with:',
      a: 3,
      o: ['The team photo', 'A list of templates completed', 'The quiz score', 'A clear call to action and impact statement'],
      e: 'Slides 7–8 communicate impact and what the audience should do or believe — the memorable closing.'
    },
    {
      q: 'The Test phase closes the DT cycle by:',
      a: 2,
      o: ['Finishing all templates', 'Submitting the zip file', 'Using real feedback to improve the solution and reflect on learning', 'Presenting to parents'],
      e: 'Testing is not the end — it loops back. Real user feedback drives meaningful improvement and deeper understanding.'
    }
  ]
};
