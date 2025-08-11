// Test to show what the reset function will delete
console.log('Testing what the reset data function will delete...');

// First, let's check what data currently exists
const checkCurrentData = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/settings/stats');
    const result = await response.json();
    
    if (result.success) {
      console.log('Current data in database:');
      console.log('- Modules:', result.data.overview.totalModules);
      console.log('- Assignments:', result.data.overview.totalAssignments);
      console.log('- Tasks:', result.data.overview.totalTasks);
      console.log('- Users:', result.data.overview.totalUsers);
    }
  } catch (error) {
    console.error('Failed to check current data:', error);
  }
};

await checkCurrentData();

console.log('\nThe reset function will delete:');
console.log('✅ ALL Study Logs (user study sessions)');
console.log('✅ ALL Assignments (homework, quizzes, tests, practicals)');
console.log('✅ ALL Tactical Tasks (study tasks, reminders)');
console.log('✅ ALL Assessment Components (assignment categories)');
console.log('✅ ALL Modules (courses/subjects)');
console.log('✅ ALL Terms (semesters, academic periods)');
console.log('✅ ALL Academic Years');
console.log('✅ ALL Degrees');

console.log('\nThe reset function will PRESERVE:');
console.log('❌ User accounts (login/authentication data)');
console.log('❌ User preferences/settings');

console.log('\n⚠️  This is a COMPLETE academic data wipe!');
console.log('⚠️  Use with extreme caution!');
console.log('⚠️  Export your data first if you want to keep it!');
