import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Typography,
  Button,
  Breadcrumbs,
} from '@material-tailwind/react';
import { useMaterialTailwindController } from '@/context';
import { performLogout } from '../../pages/auth/Logout';
export function DashboardNavbar() {
  const [controller] = useMaterialTailwindController();
  const { fixedNavbar, sidenavColor } = controller; // get sidenavColor
  const { pathname } = useLocation();
  const [layout, page] = pathname.split('/').filter((el) => el !== '');
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

const handleConfirmLogout = () => {
  setShowLogoutConfirm(false);
  performLogout(navigate); // ✅ call the shared logout logic
};

  // Tailwind hover color map (Material Tailwind doesn't allow dynamic hover:colors directly)
  const hoverColorMap = {
    blue: 'hover:bg-blue-500',
    red: 'hover:bg-red-500',
    green: 'hover:bg-green-500',
    amber: 'hover:bg-amber-500',
    teal: 'hover:bg-teal-500',
    indigo: 'hover:bg-indigo-500',
    pink: 'hover:bg-pink-500',
    purple: 'hover:bg-purple-500',
    'blue-gray': 'hover:bg-blue-gray-500',
  };

  const hoverClass = hoverColorMap[sidenavColor] || 'hover:bg-blue-gray-500';

  return (
    <>
      <Navbar
        color={fixedNavbar ? 'white' : 'transparent'}
        className={`transition-all border border-blue-gray-100 rounded-md shadow-sm ${
          fixedNavbar ? 'sticky top-4 z-40 py-3' : 'px-0 py-1'
        }`}
        fullWidth
        blurred={fixedNavbar}
      >
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center px-4">
          <div className="capitalize">
            <Breadcrumbs
              className={`bg-transparent p-0 transition-all ${
                fixedNavbar ? 'mt-1' : ''
              }`}
            >
              <Link to={`/${layout}`}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-60 transition hover:text-blue-500 hover:opacity-100"
                >
                  {layout}
                </Typography>
              </Link>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                {page}
              </Typography>
            </Breadcrumbs>
          </div>

          <Button
  onClick={() => setShowLogoutConfirm(true)}
  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md bg-blue-gray-400 text-white transition ${hoverClass}`}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
    />
  </svg>
  Logout
</Button>


        </div>
      </Navbar>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
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
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm rounded-md text-blue-gray-700 bg-blue-gray-100 hover:bg-blue-gray-200 transition"
              >
                Cancel
              </button>
              <button
  onClick={handleConfirmLogout}
  className={`px-4 py-2 text-sm rounded-md bg-blue-gray-400 text-white transition ${hoverClass}`}
>
  Logout
</button>


            </div>
          </div>
        </div>
      )}

      <div className="invisible h-10">spacer</div>
    </>
  );
}

DashboardNavbar.displayName = '/src/widgets/layout/dashboard-navbar.jsx';

export default DashboardNavbar;
