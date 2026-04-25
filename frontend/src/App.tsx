import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { ExercisePage } from "./pages/ExercisePage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("access_token")
  );

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // For demo: show exercise #1. In a real app this would come from a router.
  return <ExercisePage exerciseId={1} />;
}

export default App;
