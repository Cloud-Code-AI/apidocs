import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import DocsGeneration from './pages/DocsPage/DocsGeneration'
import './App.css'

function App() {
  return (
    <Router>
      <div className='flex flex-col w-full h-full'>
        {/* <nav>
          <ul>
            <li><Link to="/">Docs Generation</Link></li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<DocsGeneration />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
