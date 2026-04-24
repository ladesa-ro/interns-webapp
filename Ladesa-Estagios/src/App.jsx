import { BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import AppRoutes from "./routes";

function App() {
  return(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
