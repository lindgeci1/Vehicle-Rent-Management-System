import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { decodeToken } from "../../../decodeToken";
import Cookies from "js-cookie";
import CustomerView from "./Customer/CustomerView";
import AgentView from "./Agent/AgentView";
import AdminView from "./User/AdminView";
export function Profile() {
    const token = Cookies.get("token");
  const role = decodeToken(token)?.role;

  if (role === "Customer") {
    return <CustomerView />;
  }
    if (role === "Agent") {
    return <AgentView />;
  }
      if (role === "Admin") {
    return <AdminView />;
  }
  return (
    <>
    </>
  );
}

export default Profile;
