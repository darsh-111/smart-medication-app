import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Welcome from './pages/welcome.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/register.tsx';
import Choice from './pages/Choice.tsx';
import MedicineList from './pages/MedicineList.tsx';
import AddMedicine from './pages/AddMedicine.tsx';
import AlarmScreen from './pages/AlarmScreen.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/choice" element={<Choice />} />
<Route path="/alarm/:index" element={<AlarmScreen />} />        <Route path="/medicines" element={<MedicineList />} />
        <Route path="/medicines/add" element={<AddMedicine />} />
        <Route path="/medicines/edit/:index" element={<AddMedicine />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
