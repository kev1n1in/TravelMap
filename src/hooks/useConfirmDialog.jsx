import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [dialogData, setDialogData] = useState("");
  const openDialog = (data, confirmCallback) => {
    setDialogData(data);
    setOnConfirm(() => () => confirmCallback(data));
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeDialog();
  };

  return {
    ConfirmDialogComponent: (
      <ConfirmDialog
        open={open}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title="確認删除"
        contentText={
          <span>
            您確定要刪除 <span style={{ color: "#57c2e9" }}>{dialogData}</span>{" "}
            嗎？此操作無法撤銷。
          </span>
        }
        confirmButtonText="刪除"
        cancelButtonText="取消"
        confirmButtonColor="error"
      />
    ),
    openDialog,
  };
};

export default useConfirmDialog;
