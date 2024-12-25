import { useParams } from 'react-router-dom';

export default function UserDashboard() {
  const { uid } = useParams();
  
  // Optionally, retrieve user info from sessionStorage
  const sessionUser = sessionStorage.getItem('authUser');
  const user = sessionUser ? JSON.parse(sessionUser) : null;

  return (
    <div>
      <h1>Welcome to your dashboard</h1>
      <p>Your UID (from URL): {uid}</p>
      {user && (
        <>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
        </>
      )}
    </div>
  );
}