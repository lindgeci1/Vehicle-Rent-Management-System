import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

import { Home, Profile, Customer, 
  Agent, User, TripDetails, Car, Motorcycle, 
  Bus, VehicleRating, Reservation, Vehiclehistory, 
  VehiclePreCondition, VehiclePostCondition, InsurancePolicy, 
  Payment, Receipt } from "@/pages/dashboard";

import Cookies from 'js-cookie';

import {MainLogout} from '../src/pages/auth/MainLogout'
import { Vehicle } from "@/pages/dashboard";
import { VehicleMap } from "@/pages/dashboard";
import VehicleMapIcon from "./icons/VehicleMapIcon";

import ReservationIcon from "./icons/ReservationIcon";
import PaymentIcon from "./icons/PaymentIcon";
import ReceiptIcon from "./icons/ReceiptIcon";
import InsurancePolicyIcon from "./icons/InsurancePolicyIcon";

import TripDetailsIcon from "./icons/TripDetailsIcon";
import VehiclehistoryIcon from "./icons/VehiclehistoryIcon";
import VehicleRatingIcon from "./icons/VehicleRatingIcon";
import VehiclePreConditionIcon from "./icons/VehiclePreConditionIcon";
import VehiclePostConditionIcon from "./icons/VehiclePostConditionIcon";

import UserIcon from "./icons/UserIcon";
import LogoutIcon from "./icons/LogoutIcon";

import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import MotorcycleIcon  from '@mui/icons-material/TwoWheeler';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { decodeToken } from '../decodeToken'

const icon = {
  className: "w-5 h-5 text-inherit",
};


  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';
  
export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <DirectionsCarFilledIcon {...icon} />,
        name: "vehicle",
        path: "/vehicle",
        element: <Vehicle />,
      },
      ...((userRole === 'Admin' ||userRole === 'Agent')? [
      {
        icon: <VehicleMapIcon className="w-6 h-6"/>,
        name: "Map",
        path: "/vehicleMap",
        element: <VehicleMap />,
            },]
      : []),
      {
        icon: <ReservationIcon className="w-6 h-6"/>,
        name: "reservation",
        path: "/reservation",
        element: <Reservation />,
      },
      ...((userRole === 'Admin' ||userRole === 'Agent')? [
      {
        icon: <DirectionsCarFilledIcon {...icon} />,
        name: "car",
        path: "/car",
        element: <Car />,
      },
      {
      icon: <MotorcycleIcon  {...icon} />,
        name: "motorcycle",
        path: "/motorcycle",
        element: <Motorcycle />,
      },
            {
        icon: <DirectionsBusIcon {...icon} />,
        name: "bus",
        path: "/bus",
        element: <Bus />,
      },
    ]
      : []),
      {
        icon: <PaymentIcon className="w-6 h-6"/>,
        name: "payment",
        path: "/payment",
        element: <Payment />,
      },
      {
        icon: <ReceiptIcon className="w-6 h-6"/>,
        name: "receipt",
        path: "/receipt",
        element: <Receipt />,
      },
            {
        icon: <InsurancePolicyIcon className="w-6 h-6"/>,
        name: "insurance",
        path: "/insurance",
        element: <InsurancePolicy />,
      },
      ...((userRole === 'Admin' ||userRole === 'Agent')? [
      {
        icon: <TripDetailsIcon className="w-6 h-6"/>,
        name: "tripdetails",
        path: "/tripdetails",
        element: <TripDetails />,
      },
      {
          icon:<VehiclehistoryIcon className="w-6 h-6" />,
          name: "vehicle history",
          path: "/vehiclehistory",
          element: <Vehiclehistory />,
        },]
      : []), 
        {
          icon:<VehicleRatingIcon  className="w-6 h-6"/>,
          name: "vehicle rating",
          path: "/vehiclerating",
          element: <VehicleRating />,
        },
        ...((userRole === 'Admin' ||userRole === 'Agent')? [
        {
          icon:<VehiclePreConditionIcon className="w-6 h-6" />,
          name: "pre-condition",
          path: "/vehicleprecondition",
          element: <VehiclePreCondition />,
        },
        {
          icon: <VehiclePostConditionIcon className="w-6 h-6"/>,
          name: "post-condition",
          path: "/vehiclepostcondition",
          element: <VehiclePostCondition />,
        },
        ]
      : []),
        ...((userRole === 'Admin')? [
        {
        icon: <UserGroupIcon {...icon} />,
        name: "customer",
        path: "/customer",
        element: <Customer />,
        },
        {
          icon: <AcademicCapIcon {...icon} />,
          name: "agent",
          path: "/agent",
          element: <Agent />,
        },
        {
          icon: <UserIcon className="w-6 h-6"/>,
          name: "user",
          path: "/user",
          element: <User />,
        },
      ]
      : []),
            {
        icon: <LogoutIcon  className="w-6 h-6" />,
        name: "logout",
        path: "/logout",
        element: <MainLogout />,
      }
    ],
  },
];

export default routes;
