import { RoutersProvider } from './router';
import { ToastContainer } from 'react-toastify';
import GlobalCallHandler from './Components/Phase_2/GlobalCallHandler';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div >
      <ToastContainer/>
      <GlobalCallHandler />
      <RoutersProvider/>
      
    </div>
  );
}

export default App;
