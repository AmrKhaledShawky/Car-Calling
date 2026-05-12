import { Toaster } from "react-hot-toast";
import Router from "./router";

function App() {
  return (
    <>
      <Router />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
