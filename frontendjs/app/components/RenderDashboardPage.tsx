import MyMenuAppBar from "./MyMenuAppBar";
import MyBox from "./MyBox";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native-web";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { fetchRooms, loadingModus, myFetch } from "./helper/fetchRoomsHelper";
import { Room } from "../api/lib/types";
import Battery1BarIcon from "@mui/icons-material/Battery1Bar";
import Battery2BarIcon from "@mui/icons-material/Battery2Bar";
import Battery3BarIcon from "@mui/icons-material/Battery3Bar";
import Battery4BarIcon from "@mui/icons-material/Battery4Bar";
import Battery5BarIcon from "@mui/icons-material/Battery5Bar";
import Battery6BarIcon from "@mui/icons-material/Battery6Bar";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import {
  getBatteryMin,
  getHumidityAverage,
  getUpdateMax,
  getTempAverage,
  getValvePos,
} from "./helper/tempHelper";
import { renderModalDiv } from "./helper/RenderModalHelper";
import { renderChangeCommitButton } from "./helper/ChangeCommitButtonHelper";

export const RenderDashboardPage: React.FC = ({}) => {
  const [addRoom, setAddRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomtName, setRoomName] = useState<string>();
  const [isLoading, setIsLoading] = useState<loadingModus>(loadingModus.done);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();
  const handleEmptyList = () => {
    console.log("handleEmptyList ");
    return <Text></Text>;
  };

  const getPos = (item: Room) => {
    const wrap = (pos: number, child: any) => {
      return (
        <div className="flex flex-col">
          {child}
          <div className="flex items-center justify-center text-xs">
            {pos.toFixed()}
          </div>
        </div>
      );
    };
    const pos = getValvePos(item);
    if (!pos) return <>na</>;
    else {
      if (pos > 0.9)
        return wrap(
          pos,
          <LocalFireDepartmentIcon color="warning" sx={{ fontSize: 32 }} />,
        );
      if (pos > 0.7)
        return (
          <LocalFireDepartmentIcon color="warning" sx={{ fontSize: 28 }} />
        );
      if (pos > 0.5)
        return (
          <LocalFireDepartmentIcon color="success" sx={{ fontSize: 24 }} />
        );
      if (pos > 0.3)
        return (
          <LocalFireDepartmentIcon color="primary" sx={{ fontSize: 20 }} />
        );

      return <LocalFireDepartmentIcon color="primary" sx={{ fontSize: 16 }} />;
    }
  };

  const showAddRoom = () => {
    if (addRoom === false) return <></>;

    const renderCommitButton = (name: boolean) => {
      return renderChangeCommitButton(
        () => {
          return roomtName === undefined || roomtName.length <= 3;
        },
        () => {
          addNewRoom();
        },
        () => {
          setAddRoom(false);
        },
      );
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
          <div className="mb-2 text-gray-500 text-xs ">
            <Text>Name</Text>
          </div>
          <div className="w-full flex m-1">
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
                setRoomName(text);
              }}
              value={roomtName}
              onFocus={() => {}} // Fires when element gets focus
              onBlur={(e) => {
                //e.target.nodeValue;
                console.log("blur1");
              }}
              //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
            />
            <div className=" m-2">{renderCommitButton(true)}</div>{" "}
          </div>
        </View>
      );
    };

    return renderModalDiv("new room", renderFormContent(), () => {
      setAddRoom(false);
    });
  };

  const addNewRoom = async () => {
    if (!roomtName) return;
    const url = "/api/heating/addRoom";
    const data = new FormData();
    data.append("name", roomtName);

    console.log("add room url", url);
    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setRooms(res.rooms);
    });
  };

  const renderRoomLine = (item: Room, idx: number) => {
    const getLastUpdate = () => {
      function formatAge(date: Date) {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

        if (minutes < 1) return "now";
        if (minutes < 60) return `${minutes}m`;

        if (minutes < 60 * 24) {
          const h = Math.trunc(minutes / 60);
          const m = minutes - h * 60;
          return `${h}h:${String(m).padStart(2, "0")}m`;
        }

        const d = Math.trunc(minutes / (60 * 24));
        const restMinutes = minutes - d * 60 * 24;
        const h = Math.trunc(restMinutes / 60);
        const m = restMinutes - h * 60;
        return `${d}d/${String(h).padStart(2, "0")}h`;
      }

      const d = getUpdateMax(item);
      if (d) return <>{formatAge(d)}</>;
      return <></>;
    };
    const getBattery = () => {
      const level = getBatteryMin(item);
      if (!level) return <></>;

      const scalledLevel = (level * 7) / 100;
      const caseLevel = Math.trunc(scalledLevel);
      switch (caseLevel) {
        case 0:
          return (
            <Battery1BarIcon
              fontSize="large"
              sx={{ color: "red" }}
            ></Battery1BarIcon>
          );
        case 1:
          return <Battery2BarIcon fontSize="large" sx={{ color: "black" }} />;
        case 2:
          return <Battery3BarIcon fontSize="large" sx={{ color: "gray" }} />;
        case 3:
          return <Battery4BarIcon fontSize="large" sx={{ color: "gray" }} />;
        case 4:
          return <Battery5BarIcon fontSize="large" sx={{ color: "gray" }} />;
        case 5:
          return <Battery6BarIcon fontSize="large" sx={{ color: "blue" }} />;
        default:
          return <BatteryFullIcon fontSize="large" sx={{ color: "blue" }} />;
      }
    };

    return (
      <Pressable
        onPress={() => {
          const roomID = item.id.toString();
          localStorage.setItem("currentRoom", roomID);
          router.push("/room");
        }}
      >
        <div className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
          <div className="basis-40 shrink-0 flex h-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            <div className="truncate font-semibold text-gray-900">
              {item.name}
            </div>
          </div>
          <div className="basis-16 shrink-0 flex flex-col h-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            <div className="truncate font-semibold text-gray-900 text-xl">
              {getTempAverage(item)}
              {"°C"}
            </div>
            <div className="truncate font-semibold text-gray-900 text-s">
              {getHumidityAverage(item)}
              {"%"}
            </div>
          </div>
          <div className="basis-16 shrink-0 flex h-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            <div className="truncate font-semibold text-gray-900">
              {getPos(item)}
            </div>
          </div>
          <div className="basis-8 shrink-0 flex h-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
            {getBattery()}
          </div>
        </div>
        <div className="text-xs absolute right-2 bottom-2 z-50">
          {getLastUpdate()}
        </div>
      </Pressable>
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
    console.log("useEffect isLoading");

    if (isLoading) {
      console.log(" await getMySheets() ");
      (async () => {
        //await getMySheets();
        await fetchRooms(setRooms, setIsLoading, setError, router);
      })();
    } else {
      setAddRoom(false);
      if (rooms.length === 0) {
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
        await fetchRooms(setRooms, setRefresh, setError, router);
      })();
    } else {
      if (rooms.length === 0) {
        return;
      }
    }
  }, [refresh]);

  useEffect(() => {
    if (rooms) setLastUpdate(new Date());

    setTimeout(() => {
      setRefresh(true);
    }, 30000);
  }, [rooms]);

  useEffect(() => {}, [lastUpdate]);

  useEffect(() => {}, [roomtName]);
  useEffect(() => {}, [addRoom]);

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
            data={rooms}
            //ref={(ref) => { listRef = ref; }}
            renderItem={(itemData) => {
              return renderRoomLine(itemData.item, itemData.index);
            }}
            //contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled
            ListEmptyComponent={handleEmptyList}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50, // adjust this and other parameters as needed
            }}
            keyExtractor={(item: any, index) => `${item.id}-${index}`}
          />
          {lastUpdate && (
            <div className="text-s text-gray-500item-end mt-2 justify-end text-right">
              Last updated: {lastUpdate.toLocaleString()}
            </div>
          )}
        </Box>
      );
    }
  };
  return (
    <MyBox onPress={() => {}}>
      <MyMenuAppBar
        title="My Heating"
        subMenu={["Add room"]}
        onPress={[
          () => {
            setAddRoom(true);
          },
        ]}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showAddRoom()}
      {renderRooms()}
    </MyBox>
  );
};
