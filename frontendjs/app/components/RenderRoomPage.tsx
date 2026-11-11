import MyMenuAppBar from "./MyMenuAppBar";
import MyBox from "./MyBox";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native-web";
import { Box, Checkbox } from "@mui/material";
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
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import React from "react";
import { BlurEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { it } from "node:test";
import { renderModalDiv } from "./helper/RenderModalHelper";
import { renderChangeCommitButton } from "./helper/ChangeCommitButtonHelper";
import { getHumidityAverage, getTempAverage } from "./helper/tempHelper";
import { TemperatureChart } from "./TemperatureChart";

enum setPosition {
  openPos = 0,
  maxPos = 1,
  zeroPos = 2,
  closePos = 4,
}

export const RenderRoomPage: React.FC = ({}) => {
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<loadingModus>(loadingModus.done);
  const router = useRouter();
  const handleEmptyList = () => {
    console.log("handleEmptyList ");
    return <Text></Text>;
  };
  const boxRef = useRef<HTMLDivElement>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [showStrangSettings, setShowStrangSettings] = useState(-1);
  const [addNewTermostate, setAddNewTermostate] = useState(false);
  const [addNewStrang, setAddNewStrang] = useState(false);
  const [thermostateListChanged, setThermostateListChanged] = useState(false);
  const [strangListChanged, setStrangListChanged] = useState(false);
  const [thermostateList, setThermostateList] = useState<
    Thermostat[] | undefined
  >(undefined);
  const [strangList, setStrangList] = useState<Strang[] | undefined>(undefined);
  const [moveStrangState, setMoveStrangState] = useState<StrangState | null>(
    StrangState.enabled,
  );
  const yeahOnScroll = (event: any) => {
    const totalWidth = event.nativeEvent.layoutMeasurement.width;
    const xPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(xPosition / totalWidth);
    console.log("yeahOnScroll newIndex ", newIndex);
    setCurrentSectionIndex(newIndex);
  };
  const [stepSize, setStepSize] = useState(5000);
  const [showStrangs, setShowStrangs] = useState(false);
  const listRef = useRef<any>(null);
  const hasScrolledInitially = useRef(false);

  const enableStrang = async (strangID: number, enabled: boolean) => {
    console.log("enableStrang ");

    const url = "/api/heating/enableStrang";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("roomID", roomID.toString());
    data.append("strangID", strangID.toString());
    if (enabled) data.append("enable", "true");

    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms(res.rooms);
      setIsLoading(loadingModus.done);
    });
  };

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [showStrangSettings]); // Runs only once

  useEffect(() => {
    if (!rooms || rooms.length === 0) return;
    if (moveStrangState === null) return;
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    switch (moveStrangState) {
      case StrangState.movingUp:
        moveStrang(false);
        break;
      case StrangState.movingDown:
        moveStrang(true);
        break;
      case StrangState.enabled:
        enableStrang(
          rooms[currentSectionIndex].strangs[showStrangSettings].id,
          true,
        );
        break;
      default:
        enableStrang(
          rooms[currentSectionIndex].strangs[showStrangSettings].id,
          false,
        );
        break;
    }

    setRooms((room) => {
      const copy = [...room];
      copy[currentSectionIndex].strangs[showStrangSettings].state =
        moveStrangState;
      return copy;
    });
    //setMoveStrangState(null);
  }, [moveStrangState]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [showStrangs]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [thermostateListChanged]); // Runs only once
  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [strangListChanged]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    setThermostateListChanged(false);
    if (addNewTermostate) {
      getAllThermostats();
    } else {
      if (thermostateListChanged) setIsLoading(loadingModus.quite);
      setThermostateList(undefined);
    }
  }, [addNewTermostate]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    setStrangListChanged(false);
    if (addNewStrang) {
      getAllStrangs();
    } else {
      if (strangListChanged) setIsLoading(loadingModus.quite);
      setStrangList(undefined);
    }
  }, [addNewStrang]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [thermostateList]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    if (rooms && rooms.length > 0) {
      //setCurrentSectionIndex(0);
      scrollToNewestMessage(true);
      setCurrentRoomName(rooms[currentSectionIndex].name);
      setMoveStrangState(null);
    }
  }, [rooms]); // Runs only once

  const scrollToNewestMessage = (force = false) => {
    if (!force && hasScrolledInitially.current) return;

    let scroll_idx = currentSectionIndex;
    const room_id = localStorage.getItem("currentRoom");
    if (room_id) {
      const r_id = Number(room_id);
      const idx = rooms.findIndex((u) => u.id === r_id);
      scroll_idx = idx;
      localStorage.removeItem("currentRoom");
    }

    setTimeout(() => {
      const scrollRef = listRef.current as any;

      const el = scrollRef?.getNativeScrollRef();
      if (el) {
        console.log(el.scrollLeft);
        //el.scrollLeft = currentSectionIndex * el.clientWidth;
        console.log(el.scrollWidth);
        console.log(el.clientWidth);
        console.log(el.scrollLeft);
        scrollRef?.scrollToOffset({
          offset: scroll_idx * el.clientWidth,
          animated: false,
        });
      }
    }, 500);

    hasScrolledInitially.current = rooms !== undefined;
  };

  const updateName = async () => {
    console.log("update Name ");
    const url = "/api/heating/updateRoomName";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("roomID", roomID.toString());
    data.append("name", currentRoomName);

    console.log("rooms url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms((room) => {
        const copy = [...room];
        copy[currentSectionIndex].name = currentRoomName;
        return copy;
      });
    });
  };

  const increaseStep = async (targetTemperature: number, up: boolean) => {
    console.log("update Name ");
    const currentTargetTemp = targetTemperature;
    const targetTemp: number = up
      ? +currentTargetTemp + 0.5
      : +currentTargetTemp - 0.5;
    console.log("new temp ", JSON.stringify(targetTemp));

    const url = "/api/heating/setRoomTemp";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("roomID", roomID.toString());
    data.append("target", targetTemp.toFixed(2));
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms((room) => {
        const copy = [...room];
        copy[currentSectionIndex].targetTemperature = targetTemp;
        return copy;
      });
    });
  };

  const getAllThermostats = async () => {
    console.log("getAllThermostats ");

    const url = "/api/heating/thermostats";
    const data = new FormData();
    console.log(" url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setThermostateList(res.thermostats);
    });
  };

  const getAllStrangs = async () => {
    console.log("getAllThermostats ");

    const url = "/api/heating/strangs";
    const data = new FormData();
    console.log(" url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setStrangList(res.strangs);
    });
  };

  const connectRoom = async (thermostatID: number) => {
    console.log("connectRoom ");

    const url = "/api/heating/connectRoom";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("roomID", roomID.toString());
    data.append("thermostatID", thermostatID.toString());
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setThermostateList(res.thermostats);
      setThermostateListChanged(true);
    });
  };

  const connectRoomStrang = async (strangID: number) => {
    console.log("connectRoom ");

    const url = "/api/heating/connectStrang";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("roomID", roomID.toString());
    data.append("strangID", strangID.toString());
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms(res.rooms);
      setStrangListChanged(true);
    });
  };

  const getStrangIdx = (
    strangs: Strang[],
    strangID: number,
  ): Strang | undefined => {
    const ret = strangs.find((element) => {
      return element.id === strangID;
    });
    return ret;
  };

  const stopStrangMovement = async () => {
    console.log("stopStrangMovement ");
    const url = "/api/heating/stopStrang";
    const data = new FormData();
    const room = rooms[currentSectionIndex];
    const strang = room.strangs[showStrangSettings];
    data.append("strangID", strang.id.toString());

    console.log("rooms url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms((room) => {
        const copy = [...room];
        const local_strang = getStrangIdx(
          copy[currentSectionIndex].strangs,
          strang.id,
        );
        if (local_strang) {
          local_strang.currentPos = res.newPos;
          return copy;
        }
        return room;
      });
    });
  };

  const setStrangPos = async (pos: setPosition) => {
    console.log("setStrangPos ");
    const url =
      pos === setPosition.zeroPos
        ? "/api/heating/setStrangZero"
        : pos === setPosition.maxPos
          ? "/api/heating/setStrangMax"
          : pos === setPosition.openPos
            ? "/api/heating/setStrangOpen"
            : "/api/heating/setStrangClose";
    const data = new FormData();
    const room = rooms[currentSectionIndex];
    const strang = room.strangs[showStrangSettings];
    data.append("strangID", strang.id.toString());

    console.log("rooms url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms((room) => {
        const copy = [...room];
        const local_strang = getStrangIdx(
          copy[currentSectionIndex].strangs,
          strang.id,
        );
        if (local_strang) {
          switch (pos) {
            case setPosition.closePos:
              local_strang.closePos = local_strang.currentPos;
              break;
            case setPosition.openPos:
              local_strang.openPos = local_strang.currentPos;
              break;
            case setPosition.maxPos:
              local_strang.maxPos = local_strang.currentPos;
              break;
            case setPosition.zeroPos:
              local_strang.currentPos = 0;
              break;
          }
          //local_strang.currentPos = 0;
          return copy;
        }
        return room;
      });
    });
  };

  const refresh = async () => {
    setIsLoading(loadingModus.quite);
  };

  const closeOpenStrang = async (close: boolean) => {
    const room = rooms[currentSectionIndex];

    const strang = room.strangs[showStrangSettings];
    const strangID = strang.id;
    const currentPos = Math.abs((strang as any).currentPos);
    console.log("Close strang ");

    const url = close ? "/api/heating/closeStrang" : "/api/heating/openStrang";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("strangID", strangID.toString());

    console.log("rooms url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      const stepSizeInt =
        strang.currentPos - (close ? strang.closePos : strang.openPos);
      setTimeout(
        () => {
          refresh();
        },
        stepSizeInt < 0 ? -stepSizeInt : stepSizeInt,
      );

      setRooms((room) => {
        const copy = [...room];
        const strang = getStrangIdx(
          copy[currentSectionIndex].strangs,
          strangID,
        );
        if (strang) {
          strang.currentPos = close ? strang.closePos : strang.openPos;
          strang.state =
            stepSizeInt < 0 ? StrangState.movingUp : StrangState.movingDown;
          return copy;
        }
        return room;
      });
    });
  };

  const moveStrang = async (up: boolean) => {
    const room = rooms[currentSectionIndex];
    const strang = room.strangs[showStrangSettings];
    const strangID = strang.id;
    const stepSizeInt = stepSize;
    // stepSize === 0 ? 500 : stepSize === 1 ? 1000 : stepSize === 2 ? 2000 : stepSize === 3 ? 5000 : 10000;
    console.log("Close strang ");

    //setIdxStrangPosEdit(-1);
    const url = "/api/heating/moveStep";
    const data = new FormData();
    const roomID = rooms[currentSectionIndex].id;
    data.append("strangID", strangID.toString());
    data.append("stepSize", stepSizeInt.toString());
    data.append("up", up.toString());

    console.log("rooms url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setTimeout(() => {
        refresh();
      }, stepSizeInt);
    });
  };

  // renderModalDiv
  const showThermostatsList = () => {
    if (!thermostateList || !addNewTermostate || !rooms || rooms.length === 0)
      return <></>;

    const isDisabled = (item: Thermostat) => {
      if (rooms[currentSectionIndex].id === item.room_id) return false;
      if (!item.room_id || item.room_id === 0) return false;
      return true;
    };

    const renderFormContent = () => {
      return (
        <View
          style={[
            {
              width: "100%",
              margin: 4,
              alignContent: "flex-end",
              flexDirection: "column",
              alignItems: "flex-start",
              rowGap: 12,
              justifyContent: "flex-start",
            },
          ]}
        >
          <FlatList
            data={thermostateList}
            //extraData={eats}
            style={{}}
            keyExtractor={(item, index) => `id${item.id * index}`}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  textAlign: "left",
                  padding: 1,
                  rowGap: 0,
                  margin: 0,
                  width: "calc(100% - 30)",
                }}
              >
                <Checkbox
                  //indeterminate={false}
                  checked={rooms[currentSectionIndex].id === item.room_id}
                  disabled={isDisabled(item)}
                  onChange={() => {
                    connectRoom(item.id);
                  }}
                  style={{
                    color: isDisabled(item) ? "lightlightgray" : "blue",
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    <Text style={{ fontSize: 8 }}>{item.deviceID}</Text>
                  </View>
                  {item.room && (
                    <Text style={{ fontSize: 16, alignContent: "center" }}>
                      {" ("}
                      {item.room}
                      {")"}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />
        </View>
      );
    };

    return renderModalDiv(
      "Select Thermostate " + rooms[currentSectionIndex].name,
      renderFormContent(),
      () => {
        setAddNewTermostate(false);
      },
    );
  };

  const getRoomName = (room_id: number) => {
    if (!rooms) return "";
    const index = rooms.findIndex((item) => item.id === room_id);

    if (index !== -1) {
      return rooms[index].name;
    }
    return "";
  };

  const showStrangList = () => {
    if (!strangList || !addNewStrang || !rooms || rooms.length === 0)
      return <></>;

    const isStrangDisabled = (item: Strang) => {
      if (rooms[currentSectionIndex].id === item.room_Id) return false;
      if (!item.room_Id || item.room_Id === 0) return false;
      return true;
    };

    const renderFormContent = () => {
      return (
        <View
          style={[
            {
              width: "100%",
              margin: 4,
              alignContent: "flex-end",
              flexDirection: "column",
              alignItems: "flex-start",
              rowGap: 12,
              justifyContent: "flex-start",
            },
          ]}
        >
          <FlatList
            data={strangList}
            //extraData={eats}
            style={{}}
            keyExtractor={(item, index) => `id${item.id * index}`}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  textAlign: "left",
                  padding: 1,
                  rowGap: 0,
                  margin: 0,
                  width: "calc(100% - 30)",
                }}
              >
                <Checkbox
                  //indeterminate={false}
                  checked={rooms[currentSectionIndex].id === item.room_Id}
                  disabled={isStrangDisabled(item)}
                  onChange={() => {
                    connectRoomStrang(item.id);
                  }}
                  style={{
                    color: isStrangDisabled(item) ? "lightlightgray" : "blue",
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                  </View>
                  <Text style={{ fontSize: 16, alignContent: "center" }}>
                    {" ("}
                    {getRoomName(item.room_Id)}
                    {")"}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      );
    };

    return renderModalDiv(
      "Select Strang " + rooms[currentSectionIndex].name,
      renderFormContent(),
      () => {
        setAddNewStrang(false);
      },
    );
  };

  const showStrangConfig = () => {
    if (showStrangSettings < 0 || !rooms || rooms.length === 0) return <></>;

    const room = rooms[currentSectionIndex];
    const strang = room.strangs[showStrangSettings];

    const buttonColor =
      strang.state === StrangState.enabled ? "gray" : "lightgray";

    const renderFormContent = () => {
      const renderPosition = () => {
        const positions = [
          { text: "Current: ", pos: strang.currentPos },

          { text: "Close position: ", pos: strang.closePos },

          { text: "Open position: ", pos: strang.openPos },

          { text: "Max position ", pos: strang.maxPos },
        ];
        positions.sort((a, b) => b.pos - b.pos);
        return (
          <View
            style={[
              {
                width: "100%",
                alignContent: "flex-end",
                flexDirection: "column",
                alignItems: "flex-start",
                //background: "red",
                columnGap: 10,
                margin: 2,
                justifyContent: "flex-start",
              },
            ]}
          >
            {positions.map((p, index) => (
              <View
                style={[
                  {
                    width: "100%",
                    alignContent: "flex-end",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    //background: "red",
                    columnGap: 10,
                    margin: 2,
                    justifyContent: "flex-start",
                  },
                ]}
                key={p.text + index}
              >
                <Text style={{ flex: 1 }}>{p.text}</Text>
                <Text style={{ flex: 2 }}>{p.pos}</Text>
              </View>
            ))}
          </View>
        );
      };

      return (
        <View
          style={[
            {
              width: "100%",
              margin: 4,
              alignContent: "flex-end",
              flexDirection: "column",
              alignItems: "flex-start",
              rowGap: 12,
              justifyContent: "flex-start",
            },
          ]}
        >
          <View
            style={[
              {
                width: "100%",
                alignContent: "flex-end",
                flexDirection: "row",
                alignItems: "flex-start",
                columnGap: 10,
                justifyContent: "flex-start",
              },
            ]}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  width: "80px",
                  justifyContent: "center",
                  alignContent: "center",
                },
              ]}
            >
              {strang.state === StrangState.enabled
                ? "enabled"
                : strang.state === StrangState.movingDown
                  ? "movingd down"
                  : strang.state === StrangState.movingUp
                    ? "moving up"
                    : "disable"}
            </Text>
            {(strang.state === StrangState.disabled ||
              strang.state === StrangState.enabled) && (
              <Pressable
                style={[
                  {
                    alignContent: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    right: 2,

                    backgroundColor: "gray",
                  },
                ]}
                onPress={() => {
                  const newState =
                    strang.state === StrangState.disabled
                      ? StrangState.enabled
                      : StrangState.disabled;
                  console.log("old state = " + moveStrangState);
                  setMoveStrangState(newState);
                }}
              >
                {strang.state === StrangState.disabled && (
                  <TaskAltIcon
                    color="action"
                    sx={{
                      color: "#09c618",
                      fontSize: 32,
                    }}
                  />
                )}
                {strang.state === StrangState.enabled && (
                  <UnpublishedIcon
                    color="action"
                    sx={{
                      color: "#ae0000",
                      fontSize: 32,
                    }}
                  />
                )}
              </Pressable>
            )}
          </View>
          <View style={[{ width: "100%", flexDirection: "row" }]}>
            <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 1 </Text>
            <Text
              style={[
                {
                  flex: 1,
                  textAlign: "center",
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ]}
            >
              {strang.pin1}
            </Text>
            <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 2 </Text>
            <Text
              style={[
                {
                  flex: 1,
                  textAlign: "center",
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ]}
            >
              {strang.pin2}
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View
            style={[
              {
                width: "100%",
                flexDirection: "row",
              },
            ]}
          >
            <View
              style={[
                {
                  width: "100%",
                  flexDirection: "column",
                  rowGap: 4,
                },
              ]}
            >
              {renderPosition()}
              <View
                style={{
                  //width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: 8,
                  alignContent: "flex-start",
                }}
              >
                <Pressable
                  style={[
                    {
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                      width: 46,
                      height: 46,
                      backgroundColor: buttonColor,
                    },
                  ]}
                  onPress={() => {
                    if (strang.state === StrangState.enabled)
                      setMoveStrangState(StrangState.movingUp);
                  }}
                >
                  <NorthIcon
                    color="action"
                    sx={{
                      color:
                        strang.state === StrangState.enabled
                          ? "#09c618"
                          : strang.state === StrangState.movingUp
                            ? "#1100ff"
                            : "#2a2a2a" /*, transform: "rotate(180deg)"*/,
                      fontSize: 32,
                    }}
                  />
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      const strangID = strang.id;
                      setStrangPos(setPosition.zeroPos);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    Set 0
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      const strangID = strang.id;
                      setStrangPos(setPosition.closePos);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    close Pos
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      closeOpenStrang(true);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  //width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: 8,
                  alignContent: "flex-start",
                  //alignItems: "flex-start",
                }}
              >
                <Pressable
                  style={[
                    {
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                      width: 46,
                      height: 46,
                      backgroundColor: buttonColor,
                    },
                  ]}
                  onPress={() => {
                    if (
                      strang.state === StrangState.movingDown ||
                      strang.state === StrangState.movingUp
                    ) {
                      stopStrangMovement();
                    }
                  }}
                >
                  <PausePresentationIcon
                    color="action"
                    sx={{
                      color:
                        strang.state === StrangState.movingDown ||
                        strang.state === StrangState.movingUp
                          ? "#00ff00"
                          : "#6b6b6b",
                      fontSize: 32,
                    }}
                  />
                </Pressable>
                <View
                  style={[
                    {
                      flexDirection: "column",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View style={[{ flexDirection: "row" }]}>
                    <Pressable
                      onPress={() => {
                        if (strang.state === StrangState.enabled) {
                          const strangID =
                            rooms[currentSectionIndex].strangs[
                              showStrangSettings
                            ].id;
                          refresh();
                        }
                      }}
                    >
                      <RefreshIcon
                        color="action"
                        sx={{
                          color:
                            strang.state === StrangState.enabled
                              ? "#00ff00"
                              : "#757575",
                          fontSize: 32,
                        }}
                      />
                    </Pressable>
                    <Text style={[{ alignContent: "center" }]}>Step size</Text>
                    <select
                      value={stepSize} // ...force the select's value to match the state variable...
                      onChange={(e) =>
                        setStepSize(Number.parseInt(e.target.value))
                      }
                    >
                      <option value="500">500</option>
                      <option value="1000">1000</option>
                      <option value="2000">2000</option>
                      <option value="5000">5000</option>
                    </select>
                    <Text style={[{ alignContent: "center" }]}>ms</Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  //width: "100%",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  columnGap: 8,
                  alignContent: "flex-start",
                }}
              >
                <Pressable
                  style={[
                    {
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                      width: 46,
                      height: 46,
                      backgroundColor: buttonColor,
                    },
                  ]}
                  onPress={() => {
                    if (strang.state === StrangState.enabled)
                      setMoveStrangState(StrangState.movingDown);
                  }}
                >
                  <SouthIcon
                    color="action"
                    sx={{
                      color:
                        strang.state === StrangState.enabled
                          ? "#09c618"
                          : strang.state === StrangState.movingDown
                            ? "#1100ff"
                            : "#2a2a2a",
                      fontSize: 32,
                    }}
                  />
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      setStrangPos(setPosition.maxPos);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    Set Max
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      setStrangPos(setPosition.openPos);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    open Pos
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    width: 62,
                    height: 40,
                    backgroundColor: buttonColor,
                  }}
                  onPress={() => {
                    if (strang.state === StrangState.enabled) {
                      closeOpenStrang(false);
                    }
                  }}
                >
                  <Text
                    style={[
                      {
                        color:
                          strang.state === StrangState.enabled
                            ? "#00ff00"
                            : "#2a2a2a",
                      },
                    ]}
                  >
                    Open
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      );
    };

    return renderModalDiv(strang.name, renderFormContent(), () => {
      setShowStrangSettings(-1);
    });
  };

  const smallButtonStyle = {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgb(125,125,125)",
    zIndex: 100,
  };

  const getTemperatureColor = (temp: number) => {
    let red = 230 - 2 * (20 - +temp);
    let green = 230 - 2 * (20 - +temp);
    let blue = 140 + 2 * -temp;
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  };

  const getCircleColor = (targetTemperature: number) => {
    if (rooms.length === 0) return "rgb(100, 102, 230)";

    let color = rooms ? 230 - 2 * (20 - targetTemperature) : 230;
    const ret = getTemperatureColor(targetTemperature);
    //console.log("Circle color ", ret);
    return ret;
  };

  const renderGauge = (room: Room) => {
    if (!room) return <></>;
    const targetTemperature = room.targetTemperature;
    return (
      <View
        style={[
          {
            width: 90,
            borderRadius: 45,
            height: 80,
            backgroundColor: getCircleColor(targetTemperature),
            marginLeft: "auto",
            marginRight: "auto",
          },
        ]}
      >
        <View
          style={[
            {
              top: 5,
              left: 5,
              width: 80,
              borderRadius: 40,
              height: 80,
              backgroundColor: "rgba(141, 107, 35, 0)",
              borderRightColor: "rgb(255,0,0)",
              borderRightWidth: 9,
              borderLeftWidth: 3,
              borderLeftColor: "rgb(0, 0, 255)",
              borderTopWidth: 6,
              borderTopColor: "rgb(155, 0, 155)",
              borderBottomWidth: 0,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={[{ fontSize: 22, paddingBottom: 8 }]}>
            {targetTemperature}C°
          </Text>
        </View>
        <Pressable
          style={[
            {
              position: "absolute",
              left: -4,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              bottom: -8,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "#0247af",
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          onPress={() => {
            if (showStrangSettings < 0) increaseStep(targetTemperature, false);
          }}
        >
          <ExpandMoreIcon
            color="action"
            sx={{ color: "#0247af", fontSize: 32 }}
          />
        </Pressable>
        <Pressable
          style={[
            {
              position: "absolute",
              right: -4,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              bottom: -8,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "#af0219",
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          onPress={() => {
            increaseStep(targetTemperature, true);
          }}
        >
          <ExpandLessIcon
            color="action"
            sx={{ color: "#af0219", fontSize: 32 }}
          />
        </Pressable>
      </View>
    );
  };

  const renderTemperatureView = (room: Room) => {
    const colors = [];
    for (let i = 0; i < 40; i++) {
      const color = getTemperatureColor(40 - i);
      colors.push(color);
    }
    const colorItems = [];

    const getTempIndex = (room: Room) => {
      const ret = getTempAverage(room);
      if (ret) return ret - 10;
      return 0;
    };

    for (let i = 0; i < 20; i++) {
      //console.log("color ", colors[i + currentTemp - 10]);
      colorItems.push(
        <View
          key={i}
          style={[
            {
              backgroundColor: colors[i + getTempIndex(room)],
              height: 4,
            },
          ]}
        ></View>,
      );
    }

    const getFlex = (upper: boolean) => {
      if (upper) return 36 - getTempIndex(room);
      return getTempIndex(room);
    };

    return (
      <View
        style={[
          {
            width: 20,
            height: 90,
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: "column",
            alignContent: "flex-start",
            marginLeft: 0,
            marginRight: "auto",
          },
        ]}
      >
        <View
          style={[
            {
              flex: getFlex(true),
              backgroundColor: "rgb(241, 226, 90)",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            },
          ]}
        ></View>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: "rgb(253, 10, 10)",
              marginHorizontal: -4,
            },
          ]}
        ></View>
        <View
          style={[
            {
              flex: getFlex(false),
              backgroundColor: "rgb(194, 31, 31)",

              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            },
          ]}
        ></View>
      </View>
    );
  };

  const strangButton = (item: any) => {
    return (
      <View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Pressable
          style={[
            {
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              borderWidth: 2,
              backgroundColor: "rgb(185, 185, 185)",
            },
            { borderColor: "#af0219" },
          ]}
          onPress={() => {
            enableStrang(item.id, item.enabled === 1 ? true : false);
          }}
        >
          {item.enabled === 1 && (
            <SyncDisabledIcon
              color="action"
              sx={{ color: "#af0219", fontSize: 32 }}
            />
          )}
          {item.enabled === 0 && (
            <SyncIcon color="action" sx={{ color: "#af0219", fontSize: 32 }} />
          )}
        </Pressable>
      </View>
    );
  };

  const strangCurrentPos = (item: any, index: number) => {
    const fire =
      item.currentPos < 10 ? (
        <LocalFireDepartmentIcon
          color="action"
          sx={{ color: "#0026fc", fontSize: 32 }}
        />
      ) : (
        <LocalFireDepartmentIcon
          color="action"
          sx={{ color: "#f70606", fontSize: 32 }}
        />
      );
    const notEditPos = (
      <>
        {fire}
        <Pressable
          style={[
            {
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          disabled={showStrangSettings >= 0}
          onPress={() => {
            if (showStrangSettings < 0) setShowStrangSettings(index);
          }}
        >
          <SettingsIcon
            color="action"
            sx={{
              color: showStrangSettings < 0 ? "#1100ff" : "#838383",
              fontSize: 32,
            }}
          />
        </Pressable>
      </>
    );

    return notEditPos;
    //    return idxStrangPosEdit < 0 ? notEditPos : editPos;
  };

  const renderRoomStrangCore = (item: any, index: number) => {
    //console.log("render strang ", item);

    return (
      <View
        key={index}
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor:
              index % 2 === 0 ? "rgb(129, 185, 248)" : "rgb(139, 139, 139)",
            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 2, fontSize: 18 }]}>{item.name}</Text>
        {!item.pin1 && (
          <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
            na
          </Text>
        )}
        {item.pin1 && (
          <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
            {item.pin1}
          </Text>
        )}
        {!item.pin2 && (
          <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
            na
          </Text>
        )}
        {item.pin2 && (
          <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
            {item.pin2}
          </Text>
        )}

        {strangCurrentPos(item, index)}
        {strangButton(item)}
      </View>
    );
  };
  const renderRoomStrangHeader = () => {
    return (
      <View
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgb(80, 111, 250)",

            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 2, fontSize: 18 }]}>Name</Text>

        <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
          Pin 1
        </Text>
        <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
          Pin 2
        </Text>
        <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}>
          Config
        </Text>
        <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}></Text>
      </View>
    );
  };

  const renderRoomStrang = (thermostats: any) => {
    return (
      <View
        style={[
          {
            flexDirection: "column",
            flex: 1, // Fill the screen
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            backgroundColor: "#f0f0f0",
            //maxWidth: 300,
            alignSelf: "center",
            borderRadius: 6,

            padding: 0,
            width: "100%",
          },
        ]}
      >
        {renderRoomStrangHeader()}
        {thermostats.map((item: any, index: any) =>
          renderRoomStrangCore(item, index),
        )}
        {renderRoomStrangFooter()}
      </View>
    );
  };

  const renderStrangs = (room: Room) => {
    return (
      <View
        style={[
          {
            width: "80%",
            flexDirection: "column",
            marginTop: 20,
            //flex: 1, // Fill the screen
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            backgroundColor: "#f0f0f0",
            alignSelf: "center",
            borderRadius: 6,
          },
        ]}
      >
        <Pressable
          style={[
            {
              position: "absolute",
              right: 0,
              top: -4,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              borderWidth: 1,
              zIndex: 10,
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          disabled={showStrangSettings >= 0}
          onPress={() => {
            setShowStrangs(!showStrangs);
          }}
        >
          {!showStrangs && (
            <ExpandMoreIcon
              color="action"
              sx={{
                color: showStrangSettings < 0 ? "#1100ff" : "#838383",
                fontSize: 32,
              }}
            />
          )}
          {showStrangs && (
            <ExpandLessIcon
              color="action"
              sx={{
                color: showStrangSettings < 0 ? "#1100ff" : "#838383",
                fontSize: 32,
              }}
            />
          )}
        </Pressable>
        {showStrangs && renderRoomStrang(room.strangs)}
      </View>
    );
  };

  const renderRoomTemperatureHeader = () => {
    return (
      <View
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgb(80, 111, 250)",
            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 3, marginLeft: 4, fontSize: 18 }]}>Name</Text>

        <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
          Temp[C°]
        </Text>
        <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
          Hum
        </Text>
        <Text style={[{ flex: 1, textAlign: "center", fontSize: 18 }]}></Text>
      </View>
    );
  };

  const renderRoomTemperatureFooter = () => {
    return (
      <View
        style={[
          {
            alignItems: "flex-end",
            flexDirection: "row",
            width: "100%",
            padding: 2,
            alignContent: "flex-end",
            background: "lightgray",
          },
        ]}
      >
        <Pressable
          style={[
            {
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              //borderWidth: 1,
              marginLeft: "auto",
              marginRight: 1,
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          disabled={showStrangSettings >= 0}
          onPress={() => {
            setAddNewTermostate(true);
          }}
        >
          <EditNoteIcon
            color="action"
            sx={{ color: "#031cff", fontSize: 32 }}
          />
        </Pressable>
      </View>
    );
  };

  const renderRoomStrangFooter = () => {
    return (
      <View
        style={[
          {
            alignItems: "flex-end",
            flexDirection: "row",
            width: "100%",
            padding: 2,
            alignContent: "flex-end",
            background: "lightgray",
          },
        ]}
      >
        <Pressable
          style={[
            {
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              //borderWidth: 1,
              marginLeft: "auto",
              marginRight: 1,
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          disabled={showStrangSettings >= 0}
          onPress={() => {
            setAddNewStrang(true);
          }}
        >
          <EditNoteIcon
            color="action"
            sx={{ color: "#031cff", fontSize: 32 }}
          />
        </Pressable>
      </View>
    );
  };

  const renderRoomTemperatureCore = (item: Thermostat, index: number) => {
    return (
      <View
        key={index}
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor:
              index % 2 === 0 ? "rgb(129, 185, 248)" : "rgb(139, 139, 139)",
            padding: 2,
          },
        ]}
      >
        <Text style={[{ marginLeft: 4, flex: 3, fontSize: 18 }]}>
          {item.name}
        </Text>
        {item.temperature && (
          <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
            {item.temperature}
          </Text>
        )}
        {!item.temperature && (
          <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
            na
          </Text>
        )}
        {item.humidity && (
          <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
            {item.humidity} %
          </Text>
        )}
        {!item.humidity && (
          <Text style={[{ flex: 3, textAlign: "center", fontSize: 18 }]}>
            na
          </Text>
        )}
        <View
          style={[
            {
              flex: 1,
            },
          ]}
        >
          <Pressable
            style={[
              {
                marginRight: 0,
                marginLeft: "auto",
              },
            ]}
            disabled={showStrangSettings >= 0}
            onPress={() => {
              alert(
                "Device ID: " +
                  item.deviceID +
                  (item.battery ? "\rBattery:" + item.battery : ""),
              );
            }}
          >
            <InfoIcon color="action" sx={{ color: "#0019a8", fontSize: 32 }} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderRoomTemperature = (thermostats: Thermostat[]) => {
    if (!thermostats) return <></>;
    return (
      <View
        style={{
          margin: 2,
          marginTop: 8,
          flexDirection: "column",
          flex: 1, // Fill the screen
          justifyContent: "center", // Center vertically
          alignItems: "center", // Center horizontally
          backgroundColor: "#f0f0f0",
          //maxWidth: 400,
          alignSelf: "center",
          borderRadius: 6,
          rowGap: 0,
          padding: 0,
          width: "80%",
        }}
      >
        {renderRoomTemperatureHeader()}
        {thermostats.map((item: Thermostat, index: any) =>
          renderRoomTemperatureCore(item, index),
        )}
        {renderRoomTemperatureFooter()}
      </View>
    );
  };

  const renderRoom = (item: Room, idx: number) => {
    return (
      <View
        key={item.id * (idx * 3)}
        style={[
          {
            //minWidth: "100%",
            //width: "100%",
            //flex: 1,
            minWidth: calcItemWidth(),
            maxWidth: calcItemWidth(),
            alignSelf: "stretch",
            overflowY: "auto",
            //overflowY: "hidden",
            overflowX: "hidden",
            //height: "calc(100% - 0px)",
            //maxWidth: calcItemWidth(),
          },
        ]}
      >
        <View
          style={{
            //margin: 2,
            flexDirection: "column",
            flex: 1, // Fill the screen
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            rowGap: 2,
            width: "calc(100% - 1px)",
            //padding: 4,
            //background: "blue",
            alignSelf: "center",
            borderRadius: 6,
            minHeight: 70,
          }}
        >
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              },
            ]}
          >
            <Text style={[{ width: "100%" }]}>Name</Text>
            <TextInput
              // ref={nameTxtRef}
              style={[
                {
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 4,
                  flex: 3,
                },
              ]}
              onChangeText={(text) => {
                setCurrentRoomName(text);
              }}
              value={currentRoomName}
              onFocus={() => {}} // Fires when element gets focus
              onBlur={(e) => {
                //e.target.nodeValue;
                console.log("blur1");
              }}
              //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
            />
            {renderChangeCommitButton(
              () => {
                return (
                  rooms && currentRoomName === rooms[currentSectionIndex].name
                );
              },
              () => {
                updateName();
              },
              () => {
                setCurrentRoomName(rooms[currentSectionIndex].name);
              },
            )}
            <HeatPumpIcon color="primary" sx={{ fontSize: 32 }} />
          </View>
        </View>
        <View
          style={{
            margin: 2,
            flexDirection: "column",
            //flex: 1, // Fill the screen
            //height: 300,
            justifyContent: "center", // Center vertically
            alignItems: "center", // Center horizontally
            rowGap: 2,
            width: "calc(100% - 1px)",
            padding: 10,
            alignSelf: "center",
            //            background: "green",
            borderRadius: 6,
          }}
        >
          <View
            style={[
              {
                flexDirection: "row",
                columnGap: 12,
                marginLeft: "auto",
                marginRight: "auto",
              },
            ]}
          >
            <View style={{ alignItems: "flex-end", marginBottom: 20 }}>
              {renderGauge(item)}
            </View>
            <View style={{ alignItems: "flex-start" }}>
              {renderTemperatureView(item)}
            </View>
            <View
              style={[
                {
                  flexDirection: "column",
                  columnGap: 12,
                  justifyContent: "flex-start",
                },
              ]}
            >
              <Text style={[{ fontSize: 22, padding: 8 }]}>
                {item.thermostats ? getTempAverage(item) : ""}
                C°
              </Text>
              <Text style={[{ fontSize: 18, padding: 8 }]}>
                {item.thermostats ? getHumidityAverage(item) : ""} %
              </Text>
            </View>
          </View>
          {renderRoomTemperature(item.thermostats)}
          {renderStrangs(item)}
          {item.thermostats.length > 0 &&
            item.thermostats.map((t) => {
              return (
                <TemperatureChart
                  key={item.id * (idx * 3)}
                  thermostat={t}
                ></TemperatureChart>
              );
            })}
        </View>
      </View>
    );
  };

  useEffect(() => {
    console.log("useEffect main [] refresh ? ");

    (async () => {
      //await getMySheets();

      setIsLoading(loadingModus.loading);
    })();
  }, []);

  useEffect(() => {
    console.log("useEffect currentSectionIndex");
    if (rooms.length > 0) setCurrentRoomName(rooms[currentSectionIndex].name);
  }, [currentSectionIndex]);

  useEffect(() => {
    console.log("useEffect currentRoomName");
  }, [currentRoomName]);

  useEffect(() => {
    console.log("useEffect isLoading");

    if (
      isLoading === loadingModus.loading ||
      isLoading === loadingModus.quite
    ) {
      console.log(" await getMySheets() ");
      fetchRooms(setRooms, setIsLoading, setError, router);
    } else {
      if (rooms.length === 0) {
        return;
      }
    }
  }, [isLoading]);

  const calcItemWidth = () => {
    //console.log(" calcItemWidth () = ");
    if (boxRef && boxRef.current) {
      return boxRef.current.clientWidth - 10;
      boxRef.current;
      //console.log("offsetWidth:", boxRef.current.offsetWidth);
      //console.log("clientWidth:", boxRef.current.clientWidth);
      console.log(
        "bounding width:",
        //boxRef.current.getBoundingClientRect().width,
      );
    }
    return typeof window !== "undefined" ? window.innerWidth - 10 : 400;
  };

  const getItemLayout = (index: number) => ({
    length: calcItemWidth(),
    offset:
      (typeof window !== "undefined" ? window.innerWidth - 44 : 400) * index,
    index,
  });

  const renderRooms = () => {
    if (!rooms) return <Text> Loading ... </Text>;
    if (isLoading === loadingModus.loading) return <Text> Loading ... </Text>;
    if (rooms) {
      if (rooms.length === 0) {
        console.log("empty list");
        return handleEmptyList();
      }
      return (
        <Box
          sx={{
            width: "100%", // Fixed width
            minHeight: "calc(100% - 48px)", // Limit height so scrolling can occur
            maxHeight: "calc(100% - 48px)", // Limit height so scrolling can occur
            // overflowY: "auto", // Enable vertical scroll
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
          {error && <Text style={{ color: "red" }}>{error}</Text>}
          <FlatList
            style={{
              height: "100%", // Fixed width
              flex: 1,
              //paddingTop: StatusBar.currentHeight,
              //width: Dimensions.get('window').width,
              backgroundColor: "transparent",
              //height: "100%",
              //flexDirection: "row",
            }}
            //ref={(ref) => { listRef = ref; }}
            ref={(ref) => {
              listRef.current = ref;
            }}
            data={rooms}
            //ref={(ref) => { listRef = ref; }}
            renderItem={(itemData) => {
              return renderRoom(itemData.item, itemData.index);
            }}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            onScroll={(event) => {
              yeahOnScroll(event);
            }}
            //contentContainerStyle={{ flexGrow: 1 }}
            pagingEnabled // cause snapping to items
            scrollEnabled
            horizontal
            getItemLayout={(data, index) => {
              const ret = getItemLayout(index);
              // console.log(" layout ", ret);
              return ret;
            }}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 100,
            }}
            keyExtractor={(item: any, index) => `${item.id}-${index}`}
          />
        </Box>
      );
    }
  };
  return (
    <MyBox
      ref={boxRef} // Reference to list. Used to scroll to specific items.
      onPress={() => {}}
    >
      <MyMenuAppBar title="My Heating" subMenu={[]} onPress={[]} />
      {showStrangConfig()}
      {showThermostatsList()}
      {showStrangList()}
      {renderRooms()}
    </MyBox>
  );
};
