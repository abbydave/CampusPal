export const GREETING_RESPONSE = `Hi Abigail! 👋 I'm CampusPal, your personal academic assistant.

I'm here to help with anything academic — course registration, CGPA questions, portal tasks, academic policies, and more.

What can I do for you today?`

export const SCRIPT = [
  {
    id: 'rag_1_user',
    type: 'user',
    text: "Why can't I register my courses?",
  },
  {
    id: 'rag_1_ai',
    type: 'ai',
    text: `I checked your portal and the issue is that you haven't met the minimum fee payment requirement. UNILAG requires you to pay at least ₦70,000 out of your total fee of ₦145,000 before course registration is enabled. Once you make that payment and it reflects on the portal, the registration page will unlock automatically.`,
  },
  {
    id: 'rag_3_user',
    type: 'user',
    text: "Do I need to do all my compulsory courses now, or is it possible I do one of them later?",
  },
  {
    id: 'rag_3_ai',
    type: 'ai',
    text: `No, you do not have to register all your compulsory courses in one semester. Since you are on a 5-year programme, UNILAG gives you a maximum span of 7 years to complete your degree. This means you have the flexibility to spread your compulsory courses across semesters as long as you complete all of them before your final year clearance. Just make sure you're not pushing too many to your final semesters — that can create unnecessary pressure. Would you like me to help you plan which ones to prioritize?`,
  },
  {
    id: 'rag_4_user',
    type: 'user',
    text: "What is the minimum unit I can register for this semester?",
  },
  {
    id: 'rag_4_ai',
    type: 'ai',
    text: `The minimum credit load you can register per semester is 16 units. However, since you are in your final year, you have some flexibility — you are allowed to register only the courses you need to graduate, even if that total falls below 16 units. So if you only have, say, 12 units of courses left to complete your degree, you can register just those 12. Would you like me to check your outstanding courses and figure out exactly what you need?`,
  },
  {
    id: 'cgpa_1_user',
    type: 'user',
    text: "Is it possible to get first class with the current GP I have?",
  },
  {
    id: 'cgpa_1_ai',
    type: 'ai',
    text: `Yes, a first class is still within reach! Here's a breakdown:\n\n📊 **Your current standing:**\n• Units completed: 108\n• Current CGPA: 4.42\n• Total quality points so far: 477.36\n\n🎯 **What you need:**\n• Remaining units: 36\n• First class requirement: 4.50 CGPA\n• You need at least 171 quality points from your remaining 36 units (an average GP of 4.75)\n\n✅ **The good news:**\n• If you score all A's, you'll finish with a 4.57 CGPA — comfortably first class.\n• You can even afford 3 B's in 3-unit courses (9 units of B's) and still finish with a 4.50 CGPA.\n\nSo yes — there is room for a few slips, but not many. Focus on your high-unit courses. Would you like me to simulate specific scenarios for you?`,
  },
  {
    id: 'cgpa_2_user',
    type: 'user',
    text: "If I don't do a compulsory course, does it mean automatic carryover?",
  },
  {
    id: 'cgpa_2_ai',
    type: 'ai',
    text: `No, it does not mean an automatic carryover. A carryover only happens when you register for a course and then fail it (score below 40). If you simply haven't registered for a compulsory course yet, it remains an outstanding course — you still need to take it before you can graduate, but it won't appear as a failed course or negatively affect your CGPA. You can register for it in a later semester. Just make sure all compulsory courses are completed before your final clearance.`,
  },
  {
    id: 'cgpa_3_user',
    type: 'user',
    text: "If I fail a course or carryover a course, can I still get first class?",
  },
  {
    id: 'cgpa_3_ai',
    type: 'ai',
    text: `Yes, you can still get a first class even with a carryover — but the margin is tight. Here's what the numbers say:\n\n📊 **Your current standing:**\n• CGPA: 4.42 across 108 units (477.36 quality points)\n• Remaining: 36 units\n\n⚠️ **Worst-case scenario you can absorb:**\n• You can afford a C in one 2-unit course and still maintain a 4.50+ CGPA, provided you get A's in everything else.\n• That gives you 176 quality points from 36 units → final CGPA of 4.54.\n\n💡 **Strategy:**\n• If you're worried, consider registering for a few extra elective units to give yourself more room. More units at grade A can offset a bad grade.\n\nSo yes — one carryover won't end your first class dream, but you don't have room for multiple slips.`,
  },
  {
    id: 'portal_1_user',
    type: 'user',
    text: "Help me register my courses for this semester.",
  },
  {
    id: 'portal_1_ai',
    type: 'ai_thinking',
    steps: [
      'Connecting to student portal via MCP...',
      'Checking fee payment status — minimum ₦70,000 confirmed ✓',
      'Fetching compulsory courses for Computer Science, 500L, 1st Semester...',
      'Retrieved 5 compulsory courses (15 units)',
      'Fetching available electives list...',
      'Ready — waiting for your elective selection',
    ],
    clarificationText: `Here are your **compulsory courses** for 500L, 1st Semester:\n\n| Code | Course | Units |\n|------|--------|-------|\n| COS 501 | Software Engineering | 3 |\n| COS 503 | Computer Networks | 3 |\n| COS 505 | Artificial Intelligence | 3 |\n| COS 507 | Database Systems II | 3 |\n| GST 501 | Entrepreneurship | 3 |\n\n**Total compulsory: 15 units**\n\nHere are the available **electives** — you can pick up to 2:\n• ENG 301 — Technical Writing (3 units)\n• LNG 201 — Language & Communication (3 units)\n• COS 509 — Machine Learning (3 units)\n• COS 511 — Cybersecurity (3 units)\n\nWhich ones would you like me to add?`,
    finalText: null,
  },
  {
    id: 'portal_1_clarify_user',
    type: 'user',
    text: "Add ENG 301 and COS 509 please.",
  },
  {
    id: 'portal_1_clarify_ai',
    type: 'ai_thinking',
    steps: [
      'Adding ENG 301 — Technical Writing ✓',
      'Adding COS 509 — Machine Learning ✓',
      'Submitting full course list to portal...',
      'Portal confirmed — all 7 courses registered ✓',
    ],
    clarificationText: null,
    finalText: `Done! ✅ I've successfully registered your courses for this semester. Here's a summary:\n\n📋 **Compulsory courses:** 5 courses (15 units)\n📋 **Electives:** 2 courses (6 units)\n📊 **Total:** 7 courses, 21 units\n\nYou're all set. Would you like me to download your course form?`,
  },
  {
    id: 'portal_2_user',
    type: 'user',
    text: "Help me ballot for Moremi Hostel when the portal for balloting is open.",
  },
  {
    id: 'portal_2_ai',
    type: 'ai_thinking',
    steps: [
      'Confirming preferred hostel: Moremi Hall ✓',
      'Verifying student eligibility for balloting...',
      'Fee payment status: eligible ✓',
      'Setting up portal monitoring task...',
      'Background monitor active — checking portal every 5 minutes',
    ],
    clarificationText: null,
    finalText: `Got it! 🏠 I've noted your preference for Moremi Hall. Here's what will happen:\n\n• I'll keep monitoring the portal for when the accommodation balloting window opens.\n• The moment it goes live, I'll automatically ballot for Moremi Hall on your behalf.\n• I'll notify you immediately with the result — whether you got a space or not.\n\nYou don't need to do anything else. I've got you covered!`,
  },
  {
    id: 'portal_3_user',
    type: 'user',
    text: "Can you download my course registration form and my docket for me?",
  },
  {
    id: 'portal_3_ai',
    type: 'ai_thinking',
    steps: [
      'Connecting to student portal via MCP...',
      'Navigating to Course Registration section...',
      'Generating course registration form PDF...',
      'Course form ready ✓',
      'Navigating to Examination Docket section...',
      'Generating examination docket PDF...',
      'Docket ready ✓',
    ],
    clarificationText: null,
    finalText: `Here you go! 📄 I've pulled both documents from your portal:\n\n1. ✅ **Course Registration Form** — all your registered courses for this semester.\n2. ✅ **Examination Docket** — your exam schedule with dates, times, and venues.\n\nBoth files are ready below. Is there anything else you need?`,
    hasDocs: true,
  },
]
