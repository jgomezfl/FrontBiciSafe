import './App.css';

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

//importamos componentes
import NavBarExample from './Layouts/navbar';
import MapView  from './Components/MapView';
import Login from './Components/Login';
import Register from './Components/Register';
import RegBicicleta from './Components/RegBicicleta';
import Ruta from './Components/Ruta';

function App() {

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavBarExample/>}>
            <Route index element={<MapView/>} />
            <Route path='login' element={<Login/>} />
            <Route path='register' element={<Register/>} />
            <Route path='regBicicleta' element={<RegBicicleta/>} />
            <Route path='ruta' element={<Ruta />} />

            <Route path='*' element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
