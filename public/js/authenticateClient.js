const token = localStorage.getItem('jwt');

if (token) {
    const decodedToken = jwtDecode(token);

    if (decodedToken.role !== 'korisnik') {
        localStorage.removeItem('jwt');
        location.assign('/');
    }
}
else {
  location.assign('/');
}
