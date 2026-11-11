import MyMenuAppBar from "./MyMenuAppBar";
import MyBox from "./MyBox";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native-web";
import { Box, Checkbox, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { fetchRooms, loadingModus, myFetch } from "./helper/fetchRoomsHelper";
import { Room, Strang, StrangState, Thermostat } from "../api/lib/types";
import SettingsIcon from "@mui/icons-material/Settings";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import SyncDisabledIcon from "@mui/icons-material/SyncDisabled";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import InfoIcon from "@mui/icons-material/Info";
import SyncIcon from "@mui/icons-material/Sync";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import PausePresentationIcon from "@mui/icons-material/PausePresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import React from "react";
import { BlurEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { it } from "node:test";
import { renderModalDiv } from "./helper/RenderModalHelper";
import { renderChangeCommitButton } from "./helper/ChangeCommitButtonHelper";
import { error } from "node:console";

export const RenderThermostatsPage: React.FC = ({}) => {
  interface EditCell {
    line: number;
    name: boolean;
  }
  const [error, setError] = useState<string | null>(null);
  const [thermostats, setThermostats] = useState<Thermostat[]>([]);
  const [isLoading, setIsLoading] = useState<loadingModus>(loadingModus.done);
  const [editName, setEditName] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [currentEditRow, setCurrentEditRow] = useState<EditCell | null>(null);
  const router = useRouter();
  const handleEmptyList = () => {
    console.log("handleEmptyList ");
    return <Text>empty</Text>;
  };
  const renderThermoLine = (item: Thermostat, idx: number) => {
    const updateText = async () => {
      if (!currentEditRow || !editName) return;

      setCurrentEditRow(null);

      console.log("update thermostat ");
      console.log(" fetching updateName");
      setError(null);
      const url = currentEditRow.name
        ? "/api/heating/thermostatName"
        : "/api/heating/thermostatID";
      const data = new FormData();
      const thermostatID = thermostats[currentEditRow.line].id;
      data.append("ID", thermostatID.toString());
      if (currentEditRow.name) data.append("Name", editName);
      else data.append("deviceID", editName);

      console.log("rooms url", url);
      await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
        setThermostats(res.thermostats);
      });
    };

    const removeThermostate = async (idx: number) => {
      console.log("update thermostat ");
      console.log(" fetching updateName");
      const confirmed = window.confirm(
        "Are you sure you want to delete " + thermostats[idx].name + " ?",
      );

      if (!confirmed) return;
      setError(null);
      const url = "/api/heating/deleteThermostate";
      const data = new FormData();
      const thermostatID = thermostats[idx].id;
      data.append("ID", thermostatID.toString());

      console.log("rooms url", url);
      await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
        setThermostats(res.thermostats);
      });
    };

    const getNameText = () => {
      if (currentEditRow) {
        if (idx === currentEditRow.line && currentEditRow.name && editName)
          return editName;
      }

      if (idx < thermostats.length && thermostats[idx].name)
        return thermostats[idx].name;

      return "";
    };

    const getIDText = () => {
      if (currentEditRow) {
        if (idx === currentEditRow.line && !currentEditRow.name && editName)
          return editName;
      }
      if (idx < thermostats.length && thermostats[idx].deviceID)
        return thermostats[idx].deviceID;

      return "";
    };

    const updateEidtName = (text: string, name: boolean) => {
      setCurrentEditRow({ line: idx, name: name });
      setEditName(text);
    };

    const renderCommitButton = (name: boolean) => {
      return renderChangeCommitButton(
        () => {
          return (
            !thermostats ||
            !currentEditRow ||
            idx !== currentEditRow.line ||
            name !== currentEditRow.name
          );
        },
        () => {
          updateText();
        },
        () => {
          setCurrentEditRow(null);
        },
      );
    };

    return (
      <div className="flex self-stretch gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div 
        //className="w-1/2" 
        style={{ width: "40%" }}
        >
          <div className="mb-2 text-gray-500 text-xs ">
            <Text>Name</Text>
          </div>
          <div style={{ width: "100%" }}>
            <TextInput
              // ref={nameTxtRef}

              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                left: 2,
                right: 2,
                paddingHorizontal: 6,
                paddingVertical: 10,
                backgroundColor: "#f5f5f5",
              }}
              onChangeText={(text) => {
                updateEidtName(text, true);
              }}
              value={getNameText()}
              onFocus={() => {}} // Fires when element gets focus
              onBlur={(e) => {
                //e.target.nodeValue;
                console.log("blur1");
              }}
              //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
            />
            {renderCommitButton(true)}
          </div>
        </div>

        <div 
        //className="w-1/2" 
        style={{ width: "40%" }}>
          <div className="mb-2 text-gray-500 text-xs ">
            <Text>ID</Text>
          </div>
          <div style={{ width: "100%" }}>
            <TextInput
              // ref={nameTxtRef}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                left: 2,
                right: 2,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: "#f5f5f5",
              }}
              onChangeText={(text) => {
                updateEidtName(text, false);
              }}
              value={getIDText()}
              onFocus={() => {}} // Fires when element gets focus
              onBlur={(e) => {
                //e.target.nodeValue;
                console.log("blur1");
              }}
              //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
            />
            {renderCommitButton(false)}
          </div>
        </div>
        <IconButton
          sx={{ alignItems: "center", marginTop: 2, width: "20%"            
           }}
          onClick={() => {
            removeThermostate(idx);
          }}
          color="inherit"
        >
          <DeleteIcon sx={{ fontSize: "32px", mt: -1, marginBottom: -1 }} />
        </IconButton>
      </div>
    );
  };

  useEffect(() => {
    console.log("useEffect main [] refresh ? ");

    (async () => {
      //await getMySheets();
      setIsLoading(loadingModus.loading);
    })();
  }, []);

  useEffect(() => {}, [currentEditRow]);

  useEffect(() => {}, [editName]);

  useEffect(() => {
    setCurrentEditRow(null);
  }, [error]);

  const fetchThermostats = async () => {
    console.log(" fetching thermostats");
    const url = "/api/heating/thermostats";
    const data = new FormData();

    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setThermostats(res.thermostats);
      //fetchProtectedHistoryList();
      setIsLoading(loadingModus.done);
    });
  };

  useEffect(() => {
    console.log("useEffect isLoading");

    if (isLoading) {
      console.log(" await getMySheets() ");
      (async () => {
        //await getMySheets();
        await fetchThermostats();
      })();
    } else {
      if (thermostats.length === 0) {
        return;
      }
    }
  }, [isLoading]);

  useEffect(() => {
    console.log("useEffect isLoading");

    if (refresh) {
      console.log(" await getMySheets() ");
      (async () => {
        //await getMySheets();
        await fetchThermostats();
      })();
    } else {
      if (thermostats.length === 0) {
        return;
      }
    }
  }, [refresh]);

  useEffect(() => {}, [thermostats]);

  const renderThermostats = () => {
    if (!thermostats) return <Text>Loading ... </Text>;
    if (isLoading === loadingModus.loading) return <Text>Loading ... </Text>;
    if (thermostats) {
      if (thermostats.length === 0) {
        console.log("empty list");
        return handleEmptyList();
      }
      return (
        <Box
          sx={{
            width: "100%", // Fixed width
            maxHeight: "calc(100% - 48px)", // Limit height so scrolling can occur
            overflowY: "auto", // Enable vertical scroll
            border: "1px solid #ccc", // Optional styling
            borderRadius: 2,
            //p: 1,
            //flex: 1,
            backgroundColor: "#fafafa",
            alignSelf: "center",
            alignItems: "center", // Horizontal center
            justifyContent: "center", // Vertical center (optional)
            flexDirection: "column",
          }}
        >
          <FlatList
            style={{
              width: "100%", // Fixed width
              flex: 1,
              //paddingTop: StatusBar.currentHeight,
              //width: Dimensions.get('window').width,
              backgroundColor: "transparent",
              //height: "100%",
              //flexDirection: "row",
            }}
            data={thermostats}
            //ref={(ref) => { listRef = ref; }}
            renderItem={(itemData) => {
              return renderThermoLine(itemData.item, itemData.index);
            }}
            //contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled
            ListEmptyComponent={handleEmptyList}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50, // adjust this and other parameters as needed
            }}
            keyExtractor={(item: any, index) => `${item.id}-${index}`}
          />
        </Box>
      );
    }
  };
  return (
    <MyBox onPress={() => {}}>
      <MyMenuAppBar title="My Heating" subMenu={[]} onPress={[]} />
      {error && (
        <p style={{ color: "red" }}>
          <Text>{error}</Text>
        </p>
      )}
      {renderThermostats()}
    </MyBox>
  );
};
