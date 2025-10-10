import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import MainPortal from './components/pages/MainPortal'
import OutfitDetail from './components/pages/OutfitDetail'
import About from './components/pages/About'

const AppContainer = styled.div`
  min-height: 100vh;
  background: #fafafa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`

function App() {
  return (
    <AppContainer>
      <Router>
        <Routes>
          <Route path="/" element={<MainPortal />} />
          <Route path="/outfits/:outfitId" element={<OutfitDetail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </AppContainer>
  )
}

export default App
