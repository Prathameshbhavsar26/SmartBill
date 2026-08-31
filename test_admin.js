import axios from 'axios';
async function test() {
  const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'gawaliomkar2005@gmail.com', password: 'password123' });
  const token = login.data.token;
  console.log('Token:', token ? 'Success' : 'Failed');
  const res = await axios.get('http://localhost:5000/api/admin/businesses', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Businesses:', res.data.data.length);
}
test().catch(err => console.error(err.message));
