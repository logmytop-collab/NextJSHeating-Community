import { Pressable, View } from "react-native-web";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const smallButtonStyle = {
  padding: 4,
  borderRadius: 8,
  backgroundColor: "rgb(125,125,125)",
  zIndex: 100,
  height: 32,
  width: 32,
};

export const renderChangeCommitButton = (
  hide: any,
  commit: any,
  cancel: any,
) => {
  if (hide()) return <></>;

  return (
    <View style={{ flexDirection: "row", columnGap: 4 }}>
      <Pressable
        style={[smallButtonStyle]}
        onPress={() => {
          commit();
        }}
      >
        <CheckIcon fontSize="medium" color="action" sx={{ color: "#33ff00" }} />
      </Pressable>
      <Pressable
        style={[smallButtonStyle]}
        onPress={() => {
          cancel();
        }}
      >
        <HighlightOffIcon
          fontSize="medium"
          color="action"
          sx={{ color: "#af0202" }}
        />
      </Pressable>
    </View>
  );
};
