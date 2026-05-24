import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css';

import Home from './Home/Home.jsx'

function About() {
  return <h1>About Page</h1>;
}

function Contact() {
  return <h1>Contact Page</h1>;
}

function App() {
  return (
      <BrowserRouter>
          {/*<nav class="navbar navbar-default">
              <div className="container-fluid">
                  <div className="navbar-header">
                      <a className="navbar-brand" href="#">WebSiteName</a>
                  </div>
                  <ul className="nav navbar-nav">
                      <Link to="/">Home</Link>
                      <Link to="/about">About</Link>
                      <Link to="/contact">Contact</Link>
                  </ul>
              </div>
          </nav>*/}
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/about" element={<About/>}/>
              <Route path="/contact" element={<Contact/>}/>
          </Routes>
      </BrowserRouter>
);
}

export default App
