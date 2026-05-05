async function testStats() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@iba.edu.pk',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const statsRes = await fetch('http://localhost:3000/api/stats/student', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Stats status:', statsRes.status);
    console.log('Stats response:', statsData);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testStats();