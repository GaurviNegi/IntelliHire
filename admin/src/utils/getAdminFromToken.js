import jwt_decode from 'jwt-decode';




export const getAdminFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return jwt_decode(token);
  } catch (err) { 
    console.error('Invalid token', err);
    return null;
  }
};
