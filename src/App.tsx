import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { EnhancedBentoProfileComponent } from "./components/enhanced-bento-profile";
import { LinkGenerator } from "./components/link-generator";
import { LandingPage } from "./components/page";
import { SpaceLinkShare } from "./components/space-link-share";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/link-generator" element={<LinkGenerator />} />
        <Route path="/create" element={<EnhancedBentoProfileComponent />} />
        <Route path="/share" element={<SpaceLinkShare />} />
      </Routes>
    </Router>
  );
}

export default App;
