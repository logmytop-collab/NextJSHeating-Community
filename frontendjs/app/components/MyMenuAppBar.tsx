"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Menu from "@mui/material/Menu";
// @ts-ignore
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Button from "@mui/material/Button";
import PeopleIcon from "@mui/icons-material/People";
import Badge from "@mui/material/Badge";

interface CustomMenuProps {
  title: string; // Required text for the button
  subMenu: string[]; // Required text for the button
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPress: any[]; // Required click handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subButton?: null | any; // Required text for the button
  onlyMyEvent?: boolean;
  newMessages?: number;
}

const MyMenuAppBar: React.FC<CustomMenuProps> = ({
  title,
  subMenu,
  onPress,
  subButton,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  function useQuery() {
    // Custom hook to parse query parameters
    const search = useSearchParams();
    return search;
  }
  const query = useQuery();
  const en = query ? query.get("en") : "de";
  //console.log("english : ", en);

  const english = en ? en.length > 0 : false;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDashboard = () => {
    if (pathname && pathname.toLowerCase().startsWith("/dashboard"))
      return true;
    return false;
  };

  const addLogoffSubMenu = () => {
    //console.log("current URL: ", pathname);
    if (pathname && pathname.toLowerCase().startsWith("/privacy")) return <></>;
    return (
      <MenuItem
        key={"Logoff"}
        onClick={() => {
          console.log("logoff : ");

          (async () => {
            //await getMySheets();
            const url = "/api/auth/logout";
            //const url = serverURI_logout();
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
          })();

          if (english) {
            //router.push("/privacy?en=true");
            router.push("/login?en=true");
          } else router.push("/login");
        }}
      >
        {english ? "Log off" : "Ausloggen"}
      </MenuItem>
    );
  };

  const getDashboardBar = () => {
    const addThermostateSubMenu = () => {
      //console.log("current URL: ", pathname);
      return (
        <MenuItem
          key={"Thermostats"}
          onClick={() => {
            router.push("/thermostats");
          }}
        >
          Thermostats
        </MenuItem>
      );
    };

    return (
      <>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ mr: 1 }}
        >
          <MenuIcon></MenuIcon>
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={() => {
            console.log("route to settings ");
            router.push("/settings");
          }}
          color="inherit"
        >
          <AccountCircle sx={{ fontSize: "36px", mt: -1, marginBottom: -1 }} />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {subMenu.map((item, index) => (
            <MenuItem
              key={item}
              onClick={() => {
                handleClose();
                onPress[index]();
              }}
            >
              {item}
            </MenuItem>
          ))}
          {addThermostateSubMenu()}
        </Menu>
      </>
    );
  };

  const getMenu = () => {
    console.log("getMenu()");
    if (isDashboard()) return getDashboardBar();

    return (
      <>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => {
            router.push("/dashboard");
          }}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={() => {
            console.log("route to login ");
            router.push("/login");
          }}
          color="inherit"
        >
          <AccountCircle sx={{ fontSize: "36px", mt: -1, marginBottom: -1 }} />
        </IconButton>
      </>
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppBar position="static">
        <Toolbar variant="dense">{getMenu()}</Toolbar>
      </AppBar>
    </Suspense>
  );
};

export default MyMenuAppBar;
