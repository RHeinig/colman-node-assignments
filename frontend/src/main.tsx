import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";

createRoot(document.getElementById("root")!).render(
<GoogleOAuthProvider clientId="903242012284-48kb896apj8vlkj9l18hj9jvv7js7948.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>
);
