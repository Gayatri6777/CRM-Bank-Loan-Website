import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Documents are managed per loan - redirect to loans
export default function Documents() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/loans'); }, []);
  return null;
}
