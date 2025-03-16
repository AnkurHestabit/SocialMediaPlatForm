import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store";
import App from "./App";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";

const RootComponent = () => {
    const user = useSelector((state) => state.auth.user) || JSON.parse(sessionStorage.getItem("user"));

    return (
        <SocketProvider>
            <ChatProvider user={user}>
                <App />
            </ChatProvider>
        </SocketProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <RootComponent />
    </Provider>
);
