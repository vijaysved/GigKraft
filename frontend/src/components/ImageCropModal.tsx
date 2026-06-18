import "react-image-crop/dist/ReactCrop.css";

import { Button, Group, Modal, Slider, Stack, Text } from "@mantine/core";
import { useCallback, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

interface Props {
  opened: boolean;
  src: string;
  aspect?: number;
  circularCrop?: boolean;
  title?: string;
  allowSkip?: boolean;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

function startingCrop(width: number, height: number, aspect?: number): Crop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, aspect, width, height),
      width,
      height,
    );
  }
  return { unit: "%", x: 10, y: 10, width: 80, height: 80 };
}

function cropToCanvas(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  scale: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth  / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width  = Math.round(pixelCrop.width  * scaleX);
  canvas.height = Math.round(pixelCrop.height * scaleY);

  const ctx = canvas.getContext("2d")!;

  // When scale > 1, the crop region maps to a smaller portion of the natural image
  const naturalCropX = pixelCrop.x * scaleX / scale;
  const naturalCropY = pixelCrop.y * scaleY / scale;
  const naturalCropW = (pixelCrop.width  * scaleX) / scale;
  const naturalCropH = (pixelCrop.height * scaleY) / scale;

  // Center offset: scale pivots around the image center
  const naturalW = image.naturalWidth;
  const naturalH = image.naturalHeight;
  const offsetX = (naturalW - naturalW / scale) / 2;
  const offsetY = (naturalH - naturalH / scale) / 2;

  ctx.drawImage(
    image,
    naturalCropX + offsetX,
    naturalCropY + offsetY,
    naturalCropW,
    naturalCropH,
    0, 0,
    canvas.width,
    canvas.height,
  );
  return canvas;
}

export function ImageCropModal({
  opened, src, aspect, circularCrop = false,
  title = "Crop image",
  allowSkip = false,
  onConfirm, onCancel,
}: Props) {
  const imgRef   = useRef<HTMLImageElement>(null);
  const [crop,      setCrop]      = useState<Crop | undefined>(undefined);
  const [completed, setCompleted] = useState<PixelCrop | undefined>(undefined);
  const [scale,     setScale]     = useState(1);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(startingCrop(width, height, aspect));
      setCompleted(undefined);
      setScale(1);
    },
    [aspect],
  );

  function handleConfirm() {
    if (!imgRef.current || !completed) return;
    const canvas = cropToCanvas(imgRef.current, completed, scale);
    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  }

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={title}
      size="lg"
      centered
      styles={{ body: { padding: "12px 20px 20px" } }}
    >
      <Stack gap="sm">
        <Group gap="sm" align="center">
          <Text size="xs" c="dimmed" w={36}>Zoom</Text>
          <Slider
            min={1}
            max={3}
            step={0.05}
            value={scale}
            onChange={setScale}
            style={{ flex: 1 }}
            size="sm"
            label={(v) => `${Math.round(v * 100)}%`}
          />
          <Text size="xs" c="dimmed" w={40} ta="right">{Math.round(scale * 100)}%</Text>
        </Group>

        <div style={{
          maxHeight: 480,
          overflow: "hidden",
          borderRadius: 10,
          border: "1px solid var(--gk-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
        }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompleted(c)}
            aspect={aspect}
            circularCrop={circularCrop}
            keepSelection
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{
                maxWidth: "100%",
                maxHeight: 460,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                display: "block",
              }}
            />
          </ReactCrop>
        </div>

        <Text size="xs" c="dimmed">
          Drag the selection to reposition · drag handles to resize · use the slider to zoom
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onCancel}>Cancel</Button>
          {allowSkip && (
            <Button variant="light" onClick={() => onConfirm(src)}>
              Use original
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={!completed}
            style={completed ? { background: "var(--gk-brand-gradient)" } : undefined}
          >
            Apply crop
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
