const handleLogout = (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem('patients');
    localStorage.removeItem('userId');
    navigate("/");
  };
  
  export default handleLogout;
  