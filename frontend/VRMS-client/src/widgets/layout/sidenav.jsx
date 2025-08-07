import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { Box } from "@mui/material";
function mapSidenavColor(color) {
  return color === "dark" ? "blue-gray" : color;
}

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-md",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`flex flex-col ${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-lg transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className="relative flex-none">
              <Link to="/" className="flex items-center justify-center py-4 px-10">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="text-lg font-semibold tracking-wide opacity-90"
          >
            {brandName}
          </Typography>
        </Link>

        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* Scrollable routes container */}


<Box
  sx={{
    overflowY: 'auto',         // enable scrolling if needed inside routes list
    backgroundColor: '#ebeff2',

    borderRadius: 3,
    mx: 2,
    my: 1,
    px: 2,
    py: 2,
    maxHeight: 'calc(100vh - 150px)', // optional max height to limit box on tall screens
    display: 'block',           // ensure natural height, no flex-grow
  }}
>
  {routes.map(({ layout, title, pages }, key) => (
    <ul key={key} className="mb-1 flex flex-col gap-2">
      {title && (
        <li className="px-2 mt-4 mb-2">
          <Typography
            variant="small"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="font-semibold uppercase text-xs opacity-75"
          >
            {title}
          </Typography>
        </li>
      )}
      {pages.map(({ icon, name, path }) => (
        <li key={name} className="mt-1 mb-1">


          <NavLink to={`/${layout}${path}`}>
            {({ isActive }) => (
              <Button
                variant={isActive ? "gradient" : "text"}
                color={
                  isActive
                    ? mapSidenavColor(sidenavColor)
                    : sidenavType === "dark"
                    ? "white"
                    : "blue-gray"
                }
                className="flex items-center gap-4 px-3 py-2 text-sm font-medium rounded-md"
                fullWidth
              >
                {icon}
                <Typography color="inherit" className="text-sm">
                  {name}
                </Typography>
              </Button>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  ))}
</Box>



    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Vehicle Management System",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
