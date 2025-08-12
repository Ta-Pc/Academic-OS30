import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset minimal tables to avoid duplicates (dev-only convenience)
  try { 
    await prisma.tacticalTask.deleteMany(); 
  } catch {
    // Ignore errors during cleanup
  }
  await prisma.assignment.deleteMany();
  await prisma.assessmentComponent.deleteMany();
  await prisma.module.deleteMany();
  await prisma.term.deleteMany();
  await prisma.degree.deleteMany();

  // Degree only (no user needed)
  const degree = await prisma.degree.create({ data: { title: 'BSc Data Science' } });

  // Term
  const term = await prisma.term.create({
    data: {
      title: '2025 Semester 1',
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-06-30'),
      degreeId: degree.id,
    },
  });

  // Module STK120 (Statistics 120) - for test compatibility
  const stk120 = await prisma.module.create({
    data: {
      code: 'STK120',
      title: 'Statistics 120',
      creditHours: 12,
      targetMark: 75,
      termId: term.id,
    },
  });

  // Assessment components for STK120
  const cSTK120Tests = await prisma.assessmentComponent.create({
    data: { name: 'Module Tests', moduleId: stk120.id },
  });

  // Assignments for STK120 
  await prisma.assignment.createMany({
    data: [
  { title: 'Module Test 1', dueDate: new Date('2025-03-26T10:00:00+02:00'), score: 85, weight: 50, status: 'GRADED', type: 'SEMESTER_TEST', moduleId: stk120.id, componentId: cSTK120Tests.id },
  { title: 'Module Test 2', dueDate: new Date('2025-05-10T10:00:00+02:00'), score: null, weight: 50, status: 'PENDING', type: 'SEMESTER_TEST', moduleId: stk120.id, componentId: cSTK120Tests.id },
    ],
  });

  // Tactical Tasks for STK120
  await prisma.tacticalTask.createMany({
    data: [
      { title: 'Read Chapter 8: Hypothesis Testing', type: 'READ', status: 'PENDING', dueDate: new Date('2025-08-12T09:00:00+02:00'), moduleId: stk120.id, source: 'Textbook' },
      { title: 'Complete Tutorial 8', type: 'PRACTICE', status: 'PENDING', dueDate: new Date('2025-08-13T17:00:00+02:00'), moduleId: stk120.id, source: 'Tutorial' },
      { title: 'Study for Test 2', type: 'STUDY', status: 'PENDING', dueDate: new Date('2025-08-14T20:00:00+02:00'), moduleId: stk120.id },
    ],
  });

  // Module STK110 (Statistics 110)
  const stk110 = await prisma.module.create({
    data: {
      code: 'STK110',
      title: 'Statistics 110',
      creditHours: 12,
      targetMark: 75,
      termId: term.id,
    },
  });

  // Assessment components for STK110 (grouping only in V2)
  const cModuleTests = await prisma.assessmentComponent.create({
    data: { name: 'Module Tests', moduleId: stk110.id },
  });
  const cPractical = await prisma.assessmentComponent.create({
    data: { name: 'Practical Test', moduleId: stk110.id },
  });
  const cContinuous = await prisma.assessmentComponent.create({
    data: { name: 'Continuous assessments', moduleId: stk110.id },
  });

  // Assignments for STK110
  await prisma.assignment.createMany({
    data: [
  { title: 'Module Test 1', dueDate: new Date('2025-03-26T10:00:00+02:00'), score: 82, weight: 50, status: 'GRADED', type: 'SEMESTER_TEST', moduleId: stk110.id, componentId: cModuleTests.id },
  { title: 'Module Test 2', dueDate: new Date('2025-05-10T10:00:00+02:00'), score: null, weight: 25, status: 'PENDING', type: 'SEMESTER_TEST', moduleId: stk110.id, componentId: cModuleTests.id },
      { title: 'Formal Practical Test', dueDate: new Date('2025-05-23T10:00:00+02:00'), score: 40, weight: 25, status: 'GRADED', type: 'PRACTICAL', moduleId: stk110.id, componentId: cPractical.id },
  { title: 'Pre-class Assignment 1', dueDate: new Date('2025-02-17T08:00:00+02:00'), score: 9, weight: 12.5, status: 'GRADED', type: 'ASSIGNMENT', moduleId: stk110.id, componentId: cContinuous.id },
  { title: 'Post-class 1', dueDate: new Date('2025-03-07T10:00:00+02:00'), score: 8, weight: 12.5, status: 'GRADED', type: 'ASSIGNMENT', moduleId: stk110.id, componentId: cContinuous.id },
    ],
  });

  // Tactical Tasks (Weekly Mission Brief) for STK110
  await prisma.tacticalTask.createMany({
    data: [
      { title: 'Read notes on Differentiation', type: 'READ', status: 'COMPLETED', dueDate: new Date('2025-02-18T09:00:00+02:00'), moduleId: stk110.id, source: 'Lecture Notes', links: { url: 'https://lms.example.com/stk110/diff-notes' } },
      { title: 'Complete TUT 1 on Differentiation', type: 'PRACTICE', status: 'COMPLETED', dueDate: new Date('2025-02-19T17:00:00+02:00'), moduleId: stk110.id, source: 'Tutorial Set 1' },
      { title: 'Read notes on Linear Programming (LP)', type: 'READ', status: 'PENDING', dueDate: new Date('2025-03-18T09:00:00+02:00'), moduleId: stk110.id, source: 'Lecture Notes' },
      { title: 'Submit Post-class 2', type: 'ADMIN', status: 'PENDING', dueDate: new Date('2025-03-20T16:00:00+02:00'), moduleId: stk110.id, source: 'Continuous Assessment', links: { submission: 'https://lms.example.com/stk110/post-class-2' } },
      { title: 'Review feedback from Module Test 1', type: 'REVIEW', status: 'PENDING', dueDate: new Date('2025-03-28T18:00:00+02:00'), moduleId: stk110.id },
      { title: 'Study LP examples for Test 2', type: 'STUDY', status: 'PENDING', dueDate: new Date('2025-05-08T18:00:00+02:00'), moduleId: stk110.id },
    ],
  });

  // Module INF171
  const inf171 = await prisma.module.create({
    data: { code: 'INF171', title: 'Information Systems Analysis and Design', creditHours: 12, targetMark: 80, termId: term.id },
  });

  await prisma.assignment.createMany({
    data: [
      { title: 'Quiz 1', dueDate: new Date('2025-03-10T10:00:00+02:00'), score: 90, weight: 10, status: 'GRADED', type: 'QUIZ', moduleId: inf171.id },
      { title: 'Quiz 2', dueDate: new Date('2025-04-11T10:00:00+02:00'), score: 85, weight: 10, status: 'GRADED', type: 'QUIZ', moduleId: inf171.id },
  { title: 'Tutorial 1: Rich Picture', dueDate: new Date('2025-02-24T10:00:00+02:00'), score: 100, weight: 10, status: 'GRADED', type: 'TUTORIAL', moduleId: inf171.id },
  { title: 'Group Assignment 1', dueDate: new Date('2025-08-07T10:00:00+02:00'), score: null, weight: 20, status: 'PENDING', type: 'ASSIGNMENT', moduleId: inf171.id },
  { title: 'Semester Test 1', dueDate: new Date('2025-03-29T10:00:00+02:00'), score: 78, weight: 20, status: 'GRADED', type: 'SEMESTER_TEST', moduleId: inf171.id },
  { title: 'Semester Test 2', dueDate: new Date('2025-08-25T10:00:00+02:00'), score: null, weight: 20, status: 'PENDING', type: 'SEMESTER_TEST', moduleId: inf171.id },
  { title: 'Class Test 1', dueDate: new Date('2025-04-01T10:00:00+02:00'), score: 75, weight: 15, status: 'GRADED', type: 'SEMESTER_TEST', moduleId: inf171.id },
      // Add urgent assignments for testing high priority actions
  { title: 'Urgent Assignment', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), score: null, weight: 10, status: 'PENDING', type: 'ASSIGNMENT', moduleId: inf171.id },
  { title: 'Critical Task', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), score: null, weight: 15, status: 'PENDING', type: 'ASSIGNMENT', moduleId: stk110.id },
    ],
  });

  // Tactical Tasks for INF171
  await prisma.tacticalTask.createMany({
    data: [
      { title: 'Read Chapter: Systems Development Life Cycle', type: 'READ', status: 'PENDING', dueDate: new Date('2025-03-09T20:00:00+02:00'), moduleId: inf171.id },
      { title: 'Study: Use-Case Modeling', type: 'STUDY', status: 'PENDING', dueDate: new Date('2025-03-11T20:00:00+02:00'), moduleId: inf171.id },
      { title: 'Practice: Draw a Rich Picture', type: 'PRACTICE', status: 'COMPLETED', dueDate: new Date('2025-02-23T18:00:00+02:00'), moduleId: inf171.id },
      { title: 'Admin: Confirm group members', type: 'ADMIN', status: 'PENDING', dueDate: new Date('2025-08-05T17:00:00+02:00'), moduleId: inf171.id },
    ],
  });

  // Module EKN120 (Economics 120)
  const ekn120 = await prisma.module.create({
    data: { code: 'EKN120', title: 'Economics 120', creditHours: 12, targetMark: 65, termId: term.id },
  });

  await prisma.assessmentComponent.createMany({
    data: [
      { name: 'Connect Exercises & Smartbook', moduleId: ekn120.id },
      { name: 'Online testing', moduleId: ekn120.id },
      { name: 'Semester tests', moduleId: ekn120.id },
    ],
  });
  const eknComponents = await prisma.assessmentComponent.findMany({ where: { moduleId: ekn120.id } });
  const eknConnect = eknComponents.find((c: { name: string }) => c.name.includes('Connect'))!;
  const eknSem = eknComponents.find((c: { name: string }) => c.name.includes('Semester'))!;
  await prisma.assignment.createMany({
    data: [
  { title: 'Chapter 11-12 Connect', dueDate: new Date('2025-08-08T10:00:00+02:00'), score: null, weight: 30, status: 'PENDING', type: 'ASSIGNMENT', moduleId: ekn120.id, componentId: eknConnect.id },
  { title: 'Semester Test 1', dueDate: new Date('2025-08-23T10:00:00+02:00'), score: null, weight: 25, status: 'PENDING', type: 'SEMESTER_TEST', moduleId: ekn120.id, componentId: eknSem.id },
  { title: 'Semester Test 2', dueDate: new Date('2025-10-13T10:00:00+02:00'), score: null, weight: 25, status: 'PENDING', type: 'SEMESTER_TEST', moduleId: ekn120.id, componentId: eknSem.id },
    ],
  });

  // Stress-test data for the Academic Command Center widgets
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  await prisma.assignment.createMany({
    data: [
      // Overdue assignment (explicit LATE)
  { title: 'Overdue Practice Set', dueDate: twoDaysAgo, score: null, weight: 5, status: 'DUE', type: 'PRACTICAL', moduleId: ekn120.id },
      // Upcoming assignment due in 2 days
      { title: 'Upcoming Short Quiz', dueDate: twoDaysFromNow, score: null, weight: 5, status: 'PENDING', type: 'QUIZ', moduleId: ekn120.id },
      // Low graded item to make EKN120 at-risk (<50% average on graded)
      { title: 'Pop Quiz 0', dueDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), score: 20, weight: 5, status: 'GRADED', type: 'QUIZ', moduleId: ekn120.id },
    ],
  });

  // Tactical Tasks for EKN120
  await prisma.tacticalTask.createMany({
    data: [
      { title: 'Read: Market Structures overview', type: 'READ', status: 'PENDING', dueDate: new Date('2025-08-09T20:00:00+02:00'), moduleId: ekn120.id },
      { title: 'Study: Elasticity problem set', type: 'STUDY', status: 'PENDING', dueDate: new Date('2025-08-12T20:00:00+02:00'), moduleId: ekn120.id },
      { title: 'Review: Past Semester Test 1', type: 'REVIEW', status: 'PENDING', dueDate: new Date('2025-08-20T20:00:00+02:00'), moduleId: ekn120.id },
    ],
  });

  // Add some tactical tasks for the current week to test week-view
  
  await prisma.tacticalTask.createMany({
    data: [
      { title: 'Read Chapter 5: Integration', type: 'READ', status: 'PENDING', dueDate: new Date('2025-08-12T09:00:00+02:00'), moduleId: stk110.id, source: 'Textbook' },
      { title: 'Complete Practice Set 3', type: 'PRACTICE', status: 'PENDING', dueDate: new Date('2025-08-13T17:00:00+02:00'), moduleId: stk110.id, source: 'Tutorial' },
      { title: 'Study for upcoming test', type: 'STUDY', status: 'PENDING', dueDate: new Date('2025-08-14T20:00:00+02:00'), moduleId: stk110.id },
      { title: 'Review last week material', type: 'REVIEW', status: 'COMPLETED', dueDate: new Date('2025-08-11T18:00:00+02:00'), moduleId: inf171.id },
      { title: 'Submit assignment online', type: 'ADMIN', status: 'PENDING', dueDate: new Date('2025-08-15T23:59:00+02:00'), moduleId: inf171.id },
      { title: 'Read Economics Chapter 11', type: 'READ', status: 'PENDING', dueDate: new Date('2025-08-16T10:00:00+02:00'), moduleId: ekn120.id },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

