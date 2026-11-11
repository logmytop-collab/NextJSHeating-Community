import { useRouter } from "next/navigation";
import { promises } from "node:dns";

export enum loadingModus {
  loading = 0,
  quite = 1,
  done = 2,
}

export const fetchRooms = async (
  setRooms: any,
  setIsLoading: any,
  setError: any,
  router: any,
  setName: any | undefined = undefined,
) => {
  try {
    console.log(" fetching sheets");
    const url = "/api/heating/rooms";
    const data = new FormData();

    console.log("rooms url", url);
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    const res = await response.json();

    //console.log("history ", JSON.stringify(data).substring(0, 1000));
    if (res.success || res.OK === "OK") {
      setRooms(res.rooms);
      if (setName) setName(res.userName);
      //fetchProtectedHistoryList();
      setIsLoading(loadingModus.done);

      console.log(" fetching protected data yeah:");
    } else {
      console.log(" data.message:", res.message);
      if (res.message && res.message === "No token provided!")
        router.push("/login");
      else setError("Error fetching " + JSON.stringify(res));
    }
  } catch (err) {
    setError("Error fetching history list:" + String(err));
  } finally {
    setIsLoading(loadingModus.done);
  }
};

export const myFetch = async (
  url: string,
  data: FormData,
  setIsLoading: any,
  setError: any,
  router: any,
  successCall: any,
) => {
  try {
    setError(null);
    console.log("fetch url", url);
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    const res = await response.json();

    //console.log("history ", JSON.stringify(data).substring(0, 1000));
    if (res.success || res.OK === "OK") {
      successCall(res);
    } else {
      console.log(" data.message:", res.message);
      if (res.message && res.message === "No token provided!")
        router.push("/login");
      else setError("Error fetching " + JSON.stringify(res));
    }
  } catch (err) {
    setError("Error fetching " + String(JSON.stringify(data)));
  } finally {
    setIsLoading(loadingModus.done);
  }
};
