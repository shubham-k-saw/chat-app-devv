import EmailVerification from "../component/EmailVerification.jsx";
import RegistrationForm from "../component/RegistrationForm.jsx";
import { useRecoilValue } from "recoil";
import { emailAtomState } from "../stores/user/userAtom.js";
import { useNavigate } from "react-router-dom";
export const RegisterPage = () => {
  const verifiedEmail = useRecoilValue(emailAtomState);
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      
      <div>
        {!verifiedEmail ? <EmailVerification /> : <RegistrationForm />}
        <button className=" mt-3 text-center w-full" onClick={() => {
          navigate("/login")
        }}>
          <p className=" font-semibold">Already have an account? <span className=" text-green-700">Sing in</span></p>
        </button>
      </div>
    </div>
  );
};
