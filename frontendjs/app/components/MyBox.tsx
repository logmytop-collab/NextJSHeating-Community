"use client"; // <-- required to run on the client

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Suspense, useEffect, useState } from "react";
import MyCockieAlert from "./MyCockieAlert";
import { useSearchParams } from "next/dist/client/components/navigation.js";
import { View } from "react-native-web";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

interface CustomBoxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPress: any; // Required click handler
  children: React.ReactNode; // Required child nodes
  ref?: React.Ref<HTMLDivElement>;
}

const MyBox: React.FC<CustomBoxProps> = ({ onPress, children, ref }) => {
  function useQuery() {
    // Custom hook to parse query parameters
    const search = useSearchParams();
    return search;
  }
  const query = useQuery();
  const en = query ? query.get("en") : "de";
  //console.log("english : ", en);

  const english = en ? en.length > 0 : false;
  //const cookies = useCookies();
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Ensure this runs only on the client

    if (typeof window !== "undefined" && boxSize.width === 0) {
      // Handler to call on resize
      const handleResize = () => {
        // const isMobil = window.innerWidth <= 768
        console.log("window.innerWidth ...", window.innerWidth);
        //console.log("window.innerHeight ...", window.innerHeight);
        //console.log({ innerWidth: window.innerWidth, outerWidth: window.outerWidth, clientWidth: document.documentElement.clientWidth, screenWidth: window.screen.width, devicePixelRatio: window.devicePixelRatio,});
        const basedWidth = document.documentElement.clientWidth;
        const basedHeight = document.documentElement.clientHeight;
        let rationWidthHeight = basedHeight / basedWidth;
        //console.log("rationWidthHeight ...", rationWidthHeight);
        if (rationWidthHeight < 1.7) rationWidthHeight = 1.7;
        const bestWidth = basedHeight / rationWidthHeight;
        const bestHeight = basedWidth * rationWidthHeight;

        if (bestWidth < basedWidth) {
          setBoxSize({
            width: bestWidth,
            height: basedHeight,
          });
        } else {
          if (bestHeight < window.innerHeight) {
            setBoxSize({
              width: basedWidth,
              height: bestHeight,
            });
          } else {
            setBoxSize({
              width: basedWidth,
              height: basedHeight,
            });
          }
        }
      };

      // Set initial size
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Cleanup listener on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const calcHeight = () => {
    let ret = boxSize.height;
    //console.log("windowSize.height ...", boxSize.height);

    if (ret < 600) {
      ret = 600;
    }

    return ret;

    //console.log("calcHeight ...", ret);
    return ret;
  };

  const calcWidth = () => {
    /* let ret =
      windowSize.width > calcHeight() * 0.8
        ? windowSize.width * 0.8
        : calcHeight();
    const maxWidth = 580;
    if (windowSize.width > maxWidth) {
      ret = maxWidth;
    }
    const minWidth = 560;
    if (windowSize.width < minWidth) {
      ret = minWidth;
    }
    */
    //console.log("calcWidth ...", ret);
    return boxSize.width;
    //return ret;
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          //justifyContent: "flex-start", // Horizontal centering
          justifyContent: "center", // Horizontal centering
          // alignItems: "center", // Vertical centering
          backgroundColor: "transparent",
          width: "100%",
          flex: 1,
        }}
      >
        <View
          ref={ref}
          style={[
            {
              maxWidth: calcWidth(),
              width: calcWidth(),
              height: boxSize.height,
              alignItems: "flex-start", // Vertical centering
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 1,
              background: "transparent",
            },
          ]}
        >
          {children}
        </View>
        <MyCockieAlert english={english} />
      </Box>
    </Suspense>
  );
};

export default MyBox;
