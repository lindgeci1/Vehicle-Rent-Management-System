import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export function Footer({ brandName, brandLink, routes }) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-6 border-t pt-4 text-blue-gray-600">
      <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 px-4">
        <Typography variant="small" className="text-sm text-center md:text-left">
          © {year}{" "}
          <a
            href={brandLink}
            className="font-semibold text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {brandName}
          </a>
          . All rights reserved.
        </Typography>

      </div>

      <div className="mt-4 text-center">
        <Typography variant="small" className="italic text-xs text-blue-gray-400">
          Drive confidently with our trusted rental system — optimized for convenience, speed, and safety.
        </Typography>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
