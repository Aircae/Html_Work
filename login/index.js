// index.js
document.getElementById('btn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === '123456') {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
		const returnUrl = document.referrer || '../index.html';
		window.location.href = returnUrl;
    } else {
        alert('账号或密码错误');
    }
});