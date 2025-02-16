import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import BuscarEvento from "./components/BuscarEvento/BuscarEvento"
import AltaEvento from "./components/AltaEvento/AltaEvento"

function App() {

  return (


    <Router>
      <Routes>
        <Route path="/" element={<BuscarEvento />} />
        <Route path="/alta" element={<AltaEvento />} />
      </Routes>
    </Router>
  )
}

export default App


