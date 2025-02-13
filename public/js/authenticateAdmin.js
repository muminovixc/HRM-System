const token = localStorage.getItem("jwt");

if (token) {
  const decodedToken = jwtDecode(token);

  if (decodedToken.role !== "admin") {
    localStorage.removeItem("jwt");
    location.assign("/");
  }
} else {
  location.assign("/");
}
