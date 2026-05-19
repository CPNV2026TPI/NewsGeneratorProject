import 'rsuite/dist/rsuite.min.css';
import 'rsuite/TagPicker/styles/index.css';
import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import {SearchPage} from "@/pages/Search.jsx";
import {LoginPage} from "@/pages/Login.jsx";
import {useEffect} from "react";
import {jwtDecode} from "jwt-decode";

function App() {
    useEffect(() => {
        const token = localStorage.getItem("JWT");
        if (token) {
            const { exp } = jwtDecode(token);
            if (exp && Date.now() >= exp * 1000) {
                localStorage.removeItem("JWT");
            }
        }
    }, []);

    return (
        <Routes>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/search" />} />
        </Routes>
    );
}

export default App
