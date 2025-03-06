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

const SecurityQuestionModal = ({ isQAModalOpen, handleClose, QA, qaSubmitHandler }: any) => {
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
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={isQAModalOpen}
      fullWidth
       
    >
      <DialogTitle sx={{ m: 0, p: 2,  backgroundColor: "hsl(210, 100%, 16%)" }} id="customized-dialog-title" >
        Security Question
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8
        })}
      >
        <CloseIcon onClick={handleClose} />
      </IconButton>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ backgroundColor: "hsl(210, 100%, 16%)"}}>
          <FormControl fullWidth sx={{ marginTop: 1 }}>
            <FormLabel sx={{ mb: 2 }}>{QA?.question || "Loading question..."}</FormLabel>
            <TextField
              name="answer"
              value={formik.values.answer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.answer && Boolean(formik.errors.answer)}
              helperText={formik.touched.answer && formik.errors.answer}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "hsl(210, 100%, 16%)"}}>
          <Button type="submit" autoFocus>
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SecurityQuestionModal;
