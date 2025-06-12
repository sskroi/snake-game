import { Modal, Backdrop, Box } from "@mui/material";
import type { FC, ReactNode } from "react";

interface TransparentModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export const TransparentModal: FC<TransparentModalProps> = ({
  open,
  onClose,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 100,
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          zIndex: 1000,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
          outline: "none",
        }}
      >
        {children}
      </Box>
    </Modal>
  );
};
