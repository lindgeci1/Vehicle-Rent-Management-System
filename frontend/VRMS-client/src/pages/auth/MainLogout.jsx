import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';
import { performLogout } from '../auth/Logout';

export function MainLogout() {
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    performLogout(navigate);
  };

  const handleCancel = () => {
    navigate(-1); // go back to the previous page
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-md border border-blue-gray-100 shadow-md p-6 w-full max-w-md">
        <Typography className="text-lg font-semibold mb-3 text-blue-gray-800">
          Confirm Logout
        </Typography>
        <Typography className="mb-6 text-sm text-blue-gray-600">
          Are you sure you want to logout?
        </Typography>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded-md text-blue-gray-700 bg-blue-gray-100 hover:bg-blue-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLogout}
            className="px-4 py-2 text-sm rounded-md bg-blue-gray-400 text-white hover:bg-blue-gray-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
export default MainLogout;