import { BrowserRouter , Routes , Route } from "react-router-dom";
import Protect from "./Protect/Protect";
import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";


const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Protect><Dashboard/></Protect>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;