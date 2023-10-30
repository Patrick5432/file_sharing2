const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const signup_name = document.getElementById('reg-name').value;
  const signup_pass = document.getElementById('reg-pass').value;
  
  fetch('http://localhost:3000/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ signup_name, signup_pass })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.log(error));
});