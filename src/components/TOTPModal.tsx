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
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 100%, 16%)' : 'hsl(0, 0%, 98%)',
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  },
  '& .MuiDialogContent-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 100%, 16%)' : 'hsl(0, 0%, 98%)',
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  },
  '& .MuiDialogActions-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 100%, 16%)' : 'hsl(0, 0%, 98%)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  backgroundColor: '#2e7d32',
  '&:hover': {
    backgroundColor: '#4caf50',
  },
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    backgroundColor: theme.palette.mode === 'dark' ? 'hsl(210, 100%, 20%)' : '#fff',
  },
}));

const OPTModal = ({ isOpen, handleClose, handleSubmit }: any) => {
  const theme = useTheme();

  // Formik setup with validation
  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.number().required("OTP is required"),
    }),
    onSubmit: (values) => {
      handleSubmit(values); // Pass OTP to submit handler
    },
  });

  return (
    <StyledDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={isOpen}
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Enter the TOTP:
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.mode === 'dark' ? '#fff' : '#000', // Icon color based on theme
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ marginTop: 1 }}>
            <StyledFormLabel>{"OTP"}</StyledFormLabel>
            <StyledTextField
              name="otp"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <StyledButton type="submit" autoFocus>
            Verify TOTP
          </StyledButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default OPTModal;
