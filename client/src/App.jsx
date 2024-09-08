/// src/App.jsx
import { RegisterPage } from "./page/RegisterPage";
import Login from "./component/Login.jsx";
import { MessagePage } from "./page/MessagePage.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Profile } from "./component/Profile.jsx";
import { useEffect } from "react";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { currentUserAtomState } from "./stores/user/userAtom.js";
import { getCurrentUser } from "./service/api.jsx";
import { useNavigate } from "react-router-dom";

const App = () => {
  return (
    <RecoilRoot>
      <Router>
        <AppContent />
      </Router>
    </RecoilRoot>
  );
};

const AppContent = () => {
  const setCurrentUser = useSetRecoilState(currentUserAtomState);
  const navigate = useNavigate();

  useEffect(() => {
    // const api = useAxiosInterceptor(navigate);
    const fetchData = async () => {
      try {
        const storedCurrentUserInfo = localStorage.getItem("userInfo");
        console.log("app ke under")
        if (storedCurrentUserInfo) {
          setCurrentUser(JSON.parse(storedCurrentUserInfo));
        } else {
          const res = await getCurrentUser(navigate);
          setCurrentUser(res.data.data);
          localStorage.setItem("userInfo", JSON.stringify(res.data.data));
        }

      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<MessagePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/user/profile" element={<Profile />} />
      <Route path="/chat/:userId" element={<MessagePage />} />
    </Routes>
  );
};


export default App