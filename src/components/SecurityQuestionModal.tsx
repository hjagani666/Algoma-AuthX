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
  useMediaQuery
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

const SecurityQuestionModal = ({ isQAModalOpen, handleClose, QA, qaSubmitHandler }: any) => {
  const theme = useTheme();

  // Formik setup with validation
  const formik = useFormik({
    initialValues: {
      answer: "",
    },
    validationSchema: Yup.object({
      answer: Yup.string().required("Answer is required"),
    }),
    onSubmit: (values) => {
      qaSubmitHandler(values.answer); // Pass answer to submit handler
    },
  });

  return (
    <StyledDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={isQAModalOpen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Security Question
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
            <StyledFormLabel>{QA?.question || "Loading question..."}</StyledFormLabel>
            <StyledTextField
              name="answer"
              value={formik.values.answer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.answer && Boolean(formik.errors.answer)}
              helperText={formik.touched.answer && formik.errors.answer}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <StyledButton type="submit" autoFocus>
            Submit
          </StyledButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default SecurityQuestionModal;
