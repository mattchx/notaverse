import { BrowserRouter, Routes, Route } from "react-router";
import Home from './pages/Home';

function App() {
  return (
    <div className="max-w-7xl mx-auto px-8 text-center">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
