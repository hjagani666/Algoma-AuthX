import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const OPTModal = ({ isOpen, handleClose, handleSubmit }: any) => {
  // Formik setup with validation
  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.number().required("Number is required"),
    }),
    onSubmit: (values) => {
      handleSubmit(values); // Pass answer to submit handler
    },
  });

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={isOpen}
      fullWidth
    >
      <DialogTitle
        sx={{ m: 0, p: 2, backgroundColor: "hsl(210, 100%, 16%)" }}
        id="customized-dialog-title"
      >
        Enter the OTP sent to your email:
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
        })}
      >
        <CloseIcon onClick={handleClose} />
      </IconButton>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ backgroundColor: "hsl(210, 100%, 16%)" }}>
          <FormControl fullWidth sx={{ marginTop: 1 }}>
            <FormLabel sx={{ mb: 2 }}>{"OTP"}</FormLabel>
            <TextField
              name="otp"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "hsl(210, 100%, 16%)" }}>
          <Button type="submit" autoFocus>
            Verify OTP
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OPTModal;
