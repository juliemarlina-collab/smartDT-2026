/* Smart DT Project — data.js
   Quiz question sets for all 5 phases.
   Consumed by phase-engine.js renderQuiz().
   --------------------------------------------------------- */
window.SMARTDT_QUIZ = {
  1: [
    {
      q: 'What is the MAIN goal of the Empathy phase?',
      a: 0,
      o: [
        'To understand users’ real feelings, needs and experiences',
        'To build the final product immediately',
        'To choose the cheapest solution',
        'To prepare a presentation only'
      ],
      e: 'Empathy is about understanding real people — their feelings, struggles and actual needs — before any solution is considered. You cannot design well for someone you do not truly understand.'
    },
    {
      q: 'Should you already know the solution before interviewing users?',
      a: 1,
      o: [
        'True — decide first',
        'False — keep an open mind and discover',
        'True — the app requires it',
        'False — no interviews are needed'
      ],
      e: 'Entering an interview with a fixed solution causes you to ask leading questions and ignore evidence that contradicts your idea. Empathy requires an open, curious mind so real insights can surface.'
    },
    {
      q: 'Which is the BEST interview question for Empathy?',
      a: 2,
      o: [
        'Do you agree my idea is good?',
        'Do you want our product?',
        'Tell me about your experience using the canteen during peak hours.',
        'Is this problem serious?'
      ],
      e: 'Open-ended, experience-based questions invite users to share stories and feelings. Questions that lead or suggest solutions produce biased answers that do not reflect real needs.'
    },
    {
      q: 'Is interviewing one person enough for the Empathy phase?',
      a: 1,
      o: [
        'True — one user is enough',
        'False — interview at least 3 users to find patterns',
        'True — if the user is your friend',
        'False — no interviews are needed'
      ],
      e: 'One person’s experience may be unique to them. Interviewing at least 3 users lets you spot repeated patterns — the pain points that keep appearing — which are far more reliable to design for.'
    },
    {
      q: 'Which tool maps what a user SAYS, THINKS, DOES and FEELS?',
      a: 3,
      o: [
        'Persona only',
        'Problem Statement',
        'SCAMPER',
        'Empathy Map'
      ],
      e: 'The Empathy Map organises your interview evidence into four quadrants: Says (direct quotes), Thinks (inferred thoughts), Does (observed behaviours), and Feels (emotional states).'
    }
  ],
  2: [
    {
      q: 'What is the MAIN output of the Define phase?',
      a: 0,
      o: [
        'A clear user-centred problem statement based on research',
        'A finished prototype',
        'A list of random ideas',
        'A final presentation script'
      ],
      e: 'Define converts all the Empathy research into one focused problem statement. Without this step, your team may brainstorm solutions to the wrong problem.'
    },
    {
      q: 'Should the problem statement include a solution?',
      a: 1,
      o: [
        'True — include the app idea immediately',
        'False — define the problem only, never the solution',
        'True — supervisors prefer solutions first',
        'False — skip the problem statement'
      ],
      e: 'A problem statement that already contains a solution narrows thinking too early. The Define phase should frame the user need clearly so Ideation can explore many possible solutions freely.'
    },
    {
      q: 'Which HMW question is correctly formatted?',
      a: 2,
      o: [
        'We should build a canteen app.',
        'Can you make students eat faster?',
        'How might we help students eat lunch faster on campus?',
        'Why is the canteen crowded?'
      ],
      e: '"How might we…" opens up creative possibilities without prescribing a solution. It is broad enough to generate many ideas but specific enough to stay connected to the user need.'
    },
    {
      q: 'Can you skip Define if Empathy was thorough enough?',
      a: 1,
      o: [
        'True — Empathy is enough',
        'False — Empathy and Define serve different purposes',
        'True — go straight to Ideation',
        'False — skip Ideation instead'
      ],
      e: 'Empathy collects raw evidence; Define makes sense of it. Jumping from interviews to brainstorming without framing the problem first results in scattered ideas that do not address the real user need.'
    },
    {
      q: 'What should a good problem statement focus on?',
      a: 1,
      o: [
        'The technology your team likes',
        'The user’s need and the insight behind it',
        'The cheapest available solution',
        'The supervisor’s preferred product'
      ],
      e: 'A user-centred problem statement always starts from a real person’s need and the evidence that explains why that need exists.'
    }
  ],
  3: [
    {
      q: 'What is the golden rule of brainstorming?',
      a: 0,
      o: [
        'No judging or evaluating ideas during the session',
        'Choose the cheapest idea first',
        'Only write ideas from the team leader',
        'Start building the prototype immediately'
      ],
      e: 'Judging ideas during brainstorming shuts down creative thinking. When team members fear criticism, they hold back unusual ideas — and those unusual ideas are often where the most innovative solutions come from.'
    },
    {
      q: 'Should you stop when you find your first good idea?',
      a: 1,
      o: [
        'True — one good idea is enough',
        'False — push for 20+ ideas before evaluating',
        'True — avoid wasting time',
        'False — skip SCAMPER instead'
      ],
      e: 'The first idea is almost never the best one. Quantity builds quality — by pushing for 20 or more ideas, you exhaust the obvious options and reach more creative solutions.'
    },
    {
      q: 'What does the S in SCAMPER stand for?',
      a: 2,
      o: ['Score', 'Sketch', 'Substitute', 'Submit'],
      e: 'SCAMPER stands for Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse. Each prompt forces you to look at your existing ideas from a different angle.'
    },
    {
      q: 'Does the Idea Selection Matrix use gut feelings to choose?',
      a: 1,
      o: [
        'True — choose based on preference',
        'False — it uses criteria with numerical scores',
        'True — the team leader decides',
        'False — it uses interviews only'
      ],
      e: 'The Idea Selection Matrix scores each idea against criteria such as feasibility, user impact and originality using numbers. This makes the selection transparent and based on evidence.'
    },
    {
      q: 'What is the correct order for the Ideation phase?',
      a: 3,
      o: [
        'Select → Brainstorm → SCAMPER → Justify',
        'Prototype → Brainstorm → Submit → Test',
        'SCAMPER → Test → Persona → Matrix',
        'Brainstorm → SCAMPER → Select → Justify'
      ],
      e: 'You brainstorm freely first, then use SCAMPER to push ideas further, then evaluate using the selection matrix, and finally justify your chosen concept.'
    }
  ],
  4: [
    {
      q: 'What type of prototype should students build FIRST?',
      a: 0,
      o: [
        'Low-fidelity rough sketch or paper prototype',
        'Fully polished final product',
        'Expensive commercial version',
        'Only a written report'
      ],
      e: 'Low-fidelity prototypes — paper sketches, cardboard mockups, simple wireframes — can be built quickly and tested immediately. Starting rough means you can learn and improve before investing time in polish.'
    },
    {
      q: 'Must the prototype be polished before testing with users?',
      a: 1,
      o: [
        'True — it must look perfect',
        'False — rough prototypes generate honest feedback',
        'True — users cannot test rough ideas',
        'False — do not test at all'
      ],
      e: 'A polished prototype can reduce feedback quality — users hesitate to criticise something that looks finished. Rough prototypes invite honest reactions because users feel their feedback can still change things.'
    },
    {
      q: 'What is the MAIN purpose of building a prototype?',
      a: 2,
      o: [
        'To decorate the final report',
        'To replace user testing',
        'To test the idea and learn from real user feedback',
        'To avoid improving the idea'
      ],
      e: 'The prototype is a learning tool, not the final product. Its purpose is to put something tangible in front of users so you can observe how they interact with it and discover what needs to change.'
    },
    {
      q: 'If a prototype fails during testing, has the project failed?',
      a: 1,
      o: [
        'True — failure means stop the project',
        'False — failure reveals problems to improve',
        'True — delete the version log',
        'False — ignore all feedback'
      ],
      e: 'In Design Thinking, a prototype that fails during testing is a success — it revealed a real problem before you built the final version. Every failure is information that tells you exactly what to improve next.'
    },
    {
      q: 'What should the Version Log record for each iteration?',
      a: 3,
      o: [
        'Only the team members’ names',
        'Only the final score',
        'Only the supervisor comment',
        'What was built, feedback received, and what to improve next'
      ],
      e: 'The Version Log documents your design decisions and learning process. Recording what was built, what feedback came back, and what changed shows your design evolved based on real evidence.'
    }
  ],
  5: [
    {
      q: 'Who should you select as test participants?',
      a: 1,
      o: [
        'Your friends and family for convenience',
        'Real target users who match the Persona from Phase 01',
        'Only your classmates',
        'Your supervisor and lecturers'
      ],
      e: 'Testing with actual target users gives you meaningful data because they experience the real problem your solution addresses. Friends and family often give positive feedback to avoid hurting your feelings.'
    },
    {
      q: 'Should you explain how the prototype works before testing?',
      a: 1,
      o: [
        'True — explain every feature first',
        'False — never explain first; watching struggle is useful data',
        'True — users cannot test without full explanation',
        'False — cancel the test instead'
      ],
      e: 'When a user struggles to find a feature without guidance, that struggle is critical usability data. Explaining everything first removes that data.'
    },
    {
      q: 'What is most important to do during a user test?',
      a: 2,
      o: [
        'Persuade users to like the prototype',
        'Change the design during the test',
        'Observe and listen without interfering',
        'Ask only yes/no questions'
      ],
      e: 'Your role during a test is to be a quiet observer. Helping, explaining or defending the design during the session contaminates the data.'
    },
    {
      q: 'If testers complete the task, is testing done?',
      a: 1,
      o: [
        'True — completion means no more analysis',
        'False — also identify friction points and improvement opportunities',
        'True — submit immediately',
        'False — restart from Empathy'
      ],
      e: 'Task completion is only one measure. A user who completes a task but hesitates, takes a wrong path, or expresses frustration is giving you valuable improvement data.'
    },
    {
      q: 'What should happen AFTER collecting all test feedback?',
      a: 1,
      o: [
        'Submit directly to supervisor without analysis',
        'Analyse feedback patterns, create an improvement plan, then reflect',
        'Rebuild the entire prototype from scratch',
        'Present results to class immediately'
      ],
      e: 'Raw feedback only becomes useful when analysed for patterns. Identifying which issues appeared most often, planning specific improvements, and reflecting completes the Design Thinking cycle properly.'
    }
  ]
};
