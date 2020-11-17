import React from "react";
import "./App.css";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";

import Todos from "./components/Todos";

function App() {
  return (
    <AmplifyAuthenticator>
      <Todos />
    </AmplifyAuthenticator>
  );
}

export default App;
