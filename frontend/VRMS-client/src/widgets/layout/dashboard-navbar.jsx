import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Navbar,
  Typography,
  Breadcrumbs,
} from '@material-tailwind/react';
import { useMaterialTailwindController } from '@/context';

export function DashboardNavbar() {
  const [controller] = useMaterialTailwindController();
  const { fixedNavbar, sidenavColor } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split('/').filter(Boolean);

  // Tailwind hover color map for sidenav color accents
  const hoverColorMap = {
    blue: 'hover:text-blue-600',
    red: 'hover:text-red-600',
    green: 'hover:text-green-600',
    amber: 'hover:text-amber-600',
    teal: 'hover:text-teal-600',
    indigo: 'hover:text-indigo-600',
    pink: 'hover:text-pink-600',
    purple: 'hover:text-purple-600',
    'blue-gray': 'hover:text-blue-gray-600',
  };
  const hoverClass = hoverColorMap[sidenavColor] || 'hover:text-blue-gray-600';

  return (
    <>
      <Navbar
        color={fixedNavbar ? 'white' : 'transparent'}
        className={`transition-all border border-blue-gray-100 rounded-md shadow-sm ${
          fixedNavbar ? 'sticky top-4 z-40 py-3' : 'px-4 py-2'
        }`}
        fullWidth
        blurred={fixedNavbar}
      >
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="capitalize">
            <Breadcrumbs
              className={`bg-transparent p-0 text-sm transition-all ${
                fixedNavbar ? 'mt-1' : ''
              }`}
            >
              {/* Render dashboard text as plain Typography without Link */}
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-60 cursor-default select-none"
              >
                {layout || 'dashboard'}
              </Typography>

              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium capitalize"
              >
                {page || 'home'}
              </Typography>
            </Breadcrumbs>
          </div>
        </div>
      </Navbar>

      <div className="invisible h-10">spacer</div>
    </>
  );
}

DashboardNavbar.displayName = '/src/widgets/layout/dashboard-navbar.jsx';

export default DashboardNavbar;
