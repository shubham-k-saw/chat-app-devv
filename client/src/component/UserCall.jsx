/* eslint-disable react/prop-types */


const UserCall = ({ userProfilePic, onAccept, onReject }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-lg w-72">
      {/* User Profile Picture */}
      <img
        src={userProfilePic}
        alt="User Profile"
        className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
      />

      {/* Call Actions */}
      <div className="flex space-x-4">
        {/* Accept Call Button */}
        <button
          onClick={onAccept}
          className="bg-green-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Accept Call
        </button>

        {/* Reject Call Button */}
        <button
          onClick={onReject}
          className="bg-red-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Reject Call
        </button>
      </div>
    </div>
  );
};

export default UserCall;
