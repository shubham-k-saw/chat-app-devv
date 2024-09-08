import { useState } from "react";
import { useRecoilState } from "recoil";
import { currentUserAtomState } from "../stores/user/userAtom";
import {
  changePassword,
  deleteProfilePicture,
  logoutUser,
  uploadProfilePicture,
} from "../service/api";
import { userOffline } from "../service/socket";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useRecoilState(currentUserAtomState);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState("");
  const [isPasswordChangeDisabled, setIsPasswordChangeDisabled] =
    useState(false);

    const navigate = useNavigate()

  // Function to handle file selection
  const handleProfilePicChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Check file size (100 KB = 100 * 1024 bytes)
      if (selectedFile.size > 100 * 1024) {
        setUploadStatus("File size should be less than 100 KB.");
        setFile(null);
        return;
      } else {
        setUploadStatus("");
        setFile(selectedFile);
      }
    }
  };

  // Function to handle profile picture upload
  const handleUploadProfilePic = async () => {
    if (!file) {
      setUploadStatus("No file selected.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await uploadProfilePicture(formData);

      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: response.data.profilePicture,
      }));
      setUploadStatus("Profile picture uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000); // Show message for 3 seconds
    } catch (error) {
      setUploadStatus("Error uploading profile picture.");
      console.error(error);
    } finally {
      setIsUploading(false);
      setFile(null); // Clear file input after processing
    }
  };

  // Function to handle profile picture removal
  const handleRemoveProfilePic = async () => {
    setIsDeleting(true);
    try {
      // Send request to backend to remove profile picture
      await deleteProfilePicture();

      setUser((prevUser) => ({ ...prevUser, profilePicture: null }));
      setUploadStatus("Profile picture removed successfully.");
      setTimeout(() => setUploadStatus(""), 3000); // Show message for 3 seconds
    } catch (error) {
      setUploadStatus("Error removing profile picture.");
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle password change form submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeStatus("New passwords do not match.");
      return;
    }

    if (!currentPassword) {
      setPasswordChangeStatus("Password is required");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      setPasswordChangeStatus("Password changed successfully!");
      setIsPasswordChangeDisabled(true); // Disable input fields after success
      setTimeout(() => setPasswordChangeStatus(""), 3000); // Clear status after 3 seconds
      setIsChangePasswordVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setPasswordChangeStatus(error.response.data.message);
      console.log(error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("userInfo");
      setUser({});
      userOffline(user.userName);
      navigate("/login");
      console.log("Logout successfully");
    } catch (error) {
      console.log(error);
    }
  };

  // Function to toggle visibility of the change password fields
  const toggleChangePasswordFields = () => {
    setIsChangePasswordVisible(!isChangePasswordVisible);
    setPasswordChangeStatus(""); // Clear any previous status messages
    setIsPasswordChangeDisabled(false); // Re-enable input fields if they were disabled
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">{user.userName}</h1>

      <div className="flex flex-col items-center mb-6">
        <img
          src={
            user.profilePicture ||
            "https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg"
          }
          alt="Profile"
          className="w-32 h-32 rounded-full mb-4 object-cover shadow-md"
        />
        <label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition">
          Change Picture
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="hidden"
          />
        </label>

        {file && (
          <button
            onClick={handleUploadProfilePic}
            disabled={isUploading}
            className={`mt-4 text-sm bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Profile Picture"}
          </button>
        )}

        {user.profilePicture && (
          <button
            onClick={handleRemoveProfilePic}
            disabled={isDeleting}
            className={`mt-4 text-sm text-red-600 hover:text-red-800 transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Removing..." : "Remove Profile Picture"}
          </button>
        )}
      </div>

      {uploadStatus && (
        <div className="text-center text-red-600 mb-6">{uploadStatus}</div>
      )}

      <div className="text-center mb-6">
        <div className="text-gray-800 mb-2">
          <strong className="text-lg">
            {user.firstName} {user.lastName}
          </strong>{" "}
          {user?.name}
        </div>
        <div className="text-gray-800">{user?.email}</div>
      </div>

      {isChangePasswordVisible && (
        <form onSubmit={handleChangePassword} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPasswordChangeDisabled}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPasswordChangeDisabled}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPasswordChangeDisabled}
          />
          <button
            type="submit"
            className={`w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition ${
              isPasswordChangeDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPasswordChangeDisabled}
          >
            Change Password
          </button>
          {passwordChangeStatus && (
            <div className="text-center mt-4 text-red-600">
              {passwordChangeStatus}
            </div>
          )}
        </form>
      )}

      <button
        onClick={toggleChangePasswordFields}
        className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition mb-6"
      >
        {isChangePasswordVisible ? "Hide Change Password" : "Change Password"}
      </button>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export { Profile };
