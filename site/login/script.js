const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const auth_name = document.getElementById('login-name').value;
  const auth_password = document.getElementById('login-pass').value;

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ auth_name, auth_password }),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Login successful');
      } else {
        console.error('Login failed');
      }
    })
    .catch((error) => {
      console.error(error);
    });
});