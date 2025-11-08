import { Toaster } from 'react-hot-toast';
import { GameProvider } from './contexts/GameContext';
import GamePage from './components/GamePage';
import './styles/index.css';

function App() {
  return (
    <GameProvider>
      <div className="App">
        <GamePage />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E1E23',
              color: '#FFFFFF',
              border: '1px solid #8F9BA8',
            },
            success: {
              iconTheme: {
                primary: '#00C74D',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF3B30',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </GameProvider>
  );
}

export default App;