import { Box, type BoxProps } from "@mantine/core";

interface WallpaperBackgroundProps extends BoxProps {
  withOverlay?: boolean;
}

export function WallpaperBackground({
  withOverlay = true,
  ...props
}: WallpaperBackgroundProps) {
  return (
    <Box pos="absolute" inset={0} {...props}>
      <Box className="gk-wallpaper-layer" />
      {withOverlay && <Box className="gk-wallpaper-overlay" />}
    </Box>
  );
}
