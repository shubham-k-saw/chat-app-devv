
import { useState } from "react";
import { loginUser } from "../service/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for disabling the button during submission

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true); // Disable the button
    try {
      const res = await loginUser(userInput, userInput, password);
      console.log(res.cookies);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission
    }

    // Clear fields after submission
    setUserInput("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-3xl text-center pb-5 font-bold text-blue-500">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700" htmlFor="userInput">
              Username or Email
            </label>
            <input
              type="text"
              id="userInput"
              name="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username or email"
              disabled={isSubmitting} // Disable input during submission
            />
          </div>

          <div>
            <label className="block text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              disabled={isSubmitting} // Disable input during submission
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className={`w-full bg-indigo-500 text-white py-2 px-4 rounded-lg ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-600"
              } transition duration-200`}
              disabled={isSubmitting} // Disable button during submission
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>

      <button
        className="mt-3 text-center w-full"
        onClick={() => {
          if (!isSubmitting) {
            navigate("/register");
          }
        }}
      >
        <p className="font-semibold">
          Don't have an account?{" "}
          <span className="text-green-700">Sign up</span>
        </p>
      </button>
    </div>
  );
};

export default Login;

