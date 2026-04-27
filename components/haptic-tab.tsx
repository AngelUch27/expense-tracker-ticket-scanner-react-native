import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePressIn: BottomTabBarButtonProps["onPressIn"] = (ev) => {
    if (Platform.OS === "ios") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignore haptics failures and keep navigation responsive.
      });
    }

    props.onPressIn?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
    />
  );
}
