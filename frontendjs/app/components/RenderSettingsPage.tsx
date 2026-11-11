import { useRouter } from "next/navigation";
import { JSX, useEffect, useRef, useState } from "react";

import Link from "next/link";
import MyBox from "./MyBox";
import MyMenuAppBar from "./MyMenuAppBar";
import { Modal, View, Text, Pressable, TextInput } from "react-native-web";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import PasswordIcon from "@mui/icons-material/Password";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { renderModalDiv } from "@/app/components/helper/RenderModalHelper";
import { fetchRooms, myFetch } from "./helper/fetchRoomsHelper";
import { renderChangeCommitButton } from "./helper/ChangeCommitButtonHelper";
import type { Route } from "next";
import { Zigbee2mqttLink } from "./Zigbee2mqttLink";

export const RenderSettingsPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logout, setLogout] = useState(false);
  const [showChangePWD, setShowChangePWD] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [userName, setUserName] = useState("");
  const [originalUserName, setOriginalUserName] = useState("");
  const [pwdData, setPwdData] = useState({
    oldPwd: "",
    newPWD: "",
    newPWDrepeat: "",
  });
  const [error, setError] = useState("");

  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
    }
  }, [error]);

  useEffect(() => {
    if (rooms) setOriginalUserName(userName);
  }, [rooms]);

  useEffect(() => {
    if (logout) {
      //logoutUser();
    }
  }, [logout]);

  useEffect(() => {
    if (userName && userName.length > 0 && originalUserName.length === 0)
      setOriginalUserName(userName);
  }, [userName]);

  useEffect(() => {}, [originalUserName]);

  useEffect(() => {
    console.log("useEffect isLoading");

    if (isLoading) {
      console.log(" await getMySheets() ");
      (async () => {
        //await getMySheets();
        await fetchRooms(setRooms, setIsLoading, setError, router, setUserName);
      })();
    } else {
      if (rooms.length === 0) {
        return;
      }
    }
  }, [isLoading]);

  useEffect(() => {
    //     setUserData({ ...userData, image_id: 0 })
  }, [pwdData]);

  useEffect(() => {
    (async () => {
      //await getMySheets();
      //setFetchAction(FetchAction.loading);
      setIsLoading(true);
    })();
  }, []);

  const logoutUser = () => {
    router.push("/login" as Route);
    (async () => {
      const url = "/api/heating/logout";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    })();
  };

  const deployMe = async () => {
    const result = confirm("Are you sure to look for an update?");

    if (!result) {
      return;
    }

    const data = new FormData();
    await myFetch(
      "/api/heating/deployme",
      data,
      setIsLoading,
      setError,
      router,
      (res: any) => {
        alert("Wait for the update ... ");
      },
    );
  };

  const reboot = async () => {
    const result = confirm("Are you sure you want to reboot the system?");

    if (!result) {
      return;
    }

    const data = new FormData();
    await myFetch(
      "/api/heating/toober",
      data,
      setIsLoading,
      setError,
      router,
      (res: any) => {
        alert("Wait for the update ... ");
      },
    );
  };

  const updateUser = async () => {
    try {
      const data = new FormData();
      //const ext = newBase64[addImageIdx].split(",")[0].split("/")[1];
      data.append("name", userName);

      const response = await fetch("/api/heating/updateUserName", {
        method: "POST",
        body: data,
      });

      const ret = await response.json();

      if (ret.message === "No token provided!") router.push("/login" as Route);

      if (ret.success) {
        // router.push("/dashboard");
        //setFetchAction(FetchAction.idle);
        setOriginalUserName(userName);
      } else {
        setError(ret.message || "Update failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
    }
  };

  const updatePWD = async () => {
    try {
      setShowChangePWD(false);
      const data = new FormData();
      //const ext = newBase64[addImageIdx].split(",")[0].split("/")[1];
      if (pwdData.newPWD !== pwdData.newPWDrepeat) {
        setError("The new password does not match the new repeat password.");
        return;
      }
      if (pwdData.newPWD.length < 6) {
        setError("The new password is too short.");
        return;
      }
      data.append("oldPWD", pwdData.oldPwd);
      data.append("newPWD", pwdData.newPWD);

      const response = await fetch("/api/heating/changePWD", {
        method: "POST",
        body: data,
      });

      const ret = await response.json();

      if (ret.message === "No token provided!") router.push("/login" as Route);

      if (ret.success) {
        window.localStorage.setItem("heating-name", userName);
        window.localStorage.setItem("heating-password", pwdData.newPWD);
        //setFetchAction(FetchAction.idle);
      } else {
        setError(ret.message || "Update failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
    }
  };

  const closeModalAction = () => {
    setShowChangePWD(false);
  };

  const renderPWDwindow = () => {
    const ChildProcess = () => {
      return (
        <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <label htmlFor="oldPWD" className="ml-2 block text-sm text-gray-900">
            Old password
          </label>

          <input
            type="password"
            id="oldPWD"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={pwdData.oldPwd}
            onChange={(e) => setPwdData({ ...pwdData, oldPwd: e.target.value })}
          />
          <label htmlFor="newPWD" className="ml-2 block text-sm text-gray-900">
            New password
          </label>

          <input
            type="password"
            id="newPWD"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={pwdData.newPWD}
            onChange={(e) => setPwdData({ ...pwdData, newPWD: e.target.value })}
          />
          <label
            htmlFor="newPWDrepeat"
            className="ml-2 block text-sm text-gray-900"
          >
            Repeat new password
          </label>

          <input
            type="password"
            id="newPWDrepeat"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={pwdData.newPWDrepeat}
            onChange={(e) =>
              setPwdData({ ...pwdData, newPWDrepeat: e.target.value })
            }
          />

          <div className="mt-6 flex justify-end pag-4">
            <button
              type="button"
              onClick={() => {
                setShowChangePWD(false);
              }}
              className="rounded bg-blue-600 px-4 mx-4 py-2 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    };

    if (showChangePWD)
      return renderModalDiv(
        "Changing password",
        ChildProcess(),
        closeModalAction,
      );
    /*<div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setFetchAction(FetchAction.idle);
            }}
          />
*/

    return <></>;
  };

  const settingPage = () => {
    console.log("render page settings");

    return (
      <Box
        sx={{
          width: "100%",
          //maxWidth: "96%", // Fixed width
          //height: "calc(100% - 48px)", // Limit height so scrolling can occur
          //maxHeight: "calc(100% - 48px)", // Limit height so scrolling can occur
          //overflowY: "auto", // Enable vertical scroll
          border: "1px solid #ccc", // Optional styling
          //flex: 1,
          borderRadius: 2,
          //display: "flex",
          backgroundColor: "#f2f2f2",
          alignSelf: "center",
          alignItems: "center", // Horizontal center
          //justifyContent: "stretch", // Vertical center (optional)
          flexDirection: "column",
          padding: 1,
        }}
      >
        {renderPWDwindow()}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <h2 className="text-left mt-4 text-2xl font-extrabold text-gray-900">
          Edit account
        </h2>
        <View
          style={[
            {
              rowGap: 8,
              marginTop: 6,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text> Name </Text>
          <input
            id="userName"
            name="text"
            type="text"
            required
            className="appearance-none relative block w-1/2 px-3 py-2 mx-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="user name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          {renderChangeCommitButton(
            () => {
              return originalUserName === userName;
            },
            () => {
              updateUser();
            },
            () => {
              setOriginalUserName(userName);
            },
          )}
        </View>
        <div className="flex justify-center gap-2 mt-4 ">
          <button
            type="button"
            onClick={() => {
              setShowChangePWD(true);
            }}
            //className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            className="inline-flex items-center px-6 py-2 mx-3 w-34 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Change
            <PasswordIcon sx={{ marginLeft: 2 }} />
          </button>
        </div>
        <div className="flex justify-center gap-2  mt-2">
          <button
            type="button"
            onClick={() => {
              setLogout(true);
            }}
            //className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            className="inline-flex items-center  w-34 px-6 py-2 mx-3 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
            <LogoutIcon sx={{ marginLeft: 2 }} />
          </button>
        </div>
        <Zigbee2mqttLink />

        <div className="flex justify-center gap-2  mt-2">
          <button
            type="button"
            onClick={() => {
              reboot();
            }}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </Box>
    );
  };

  return (
    <MyBox
      ref={boxRef} // Reference to list. Used to scroll to specific items.
      onPress={() => {}}
    >
      <MyMenuAppBar title="Heating Hero" subMenu={[]} onPress={[]} />
      {settingPage()}
    </MyBox>
  );
};
