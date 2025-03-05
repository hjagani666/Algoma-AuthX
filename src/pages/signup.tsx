import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import AppTheme from '../theme/AppTheme';
import { MenuItem, Select, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import Grid from '@mui/material/Grid2';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { FirebaseError } from "firebase/app";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  justifyContent: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const securityQuestions = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What was your first car?",
  "What is the name of the street you grew up on?",
  "What is your favorite book?",
  "What was the name of your elementary school?",
];

const mfaOptions = [
  { label: "None", value: " " },
  { label: "Email OTP", value: "email" },
  { label: "Mobile OTP", value: "mobile" },
  { label: "Security Questions", value: "questions" },
  // { label: "TOTP (Authenticator App)", value: "totp" },
];
const db = getFirestore();

export default function SignIn(props: { disableCustomTheme?: boolean }) {

  const auth = getAuth();
  const navigate = useNavigate();
  const { session, setSession, loading } = useSession();

  const formik: any = useFormik({
    initialValues: {
      email: '',
      password: '',
      selectedMFA: ' ',
      phoneNumber: '',
      securityQuestions: [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' },
      ],
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      selectedMFA: Yup.string(),
      phoneNumber: Yup.string().when('selectedMFA', {
        is: 'mobile',
        then: (schema) => schema.required('Phone number is required'),
      }),
      securityQuestions: Yup.array().when('selectedMFA', {
        is: 'questions',
        then: (schema) =>
          schema.of(
            Yup.object().shape({
              question: Yup.string().required('Question is required'),
              answer: Yup.string().required('Answer is required'),
            })
          ),
      }),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        if (user) {
          const authData: any = {
            email: user.email,
            authMethod: values.selectedMFA,
          };

          const userSession: any = {
            user: {
              name: user.displayName || '',
              email: user.email || '',
              image: user.photoURL || '',
            },
          };
          setSession(userSession);

          if (values.selectedMFA === "mobile") {
            authData.phoneNumber = values.phoneNumber;
          } else if (values.selectedMFA === "questions") {
            authData.securityQuestions = values.securityQuestions;
          }

          await setDoc(doc(db, "users", user.uid), authData);
          toast.success("User Registered Successfully!");
          navigate("/", { replace: true });
        }
      } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/email-already-in-use":
              errorMessage = "This email is already registered.";
              break;
            case "auth/invalid-email":
              errorMessage = "Invalid email format.";
              break;
            case "auth/weak-password":
              errorMessage = "Password should be at least 6 characters.";
              break;
            case "auth/network-request-failed":
              errorMessage = "Network error. Check your internet connection.";
            case "auth/operation-not-allowed":
              errorMessage = "Email/password accounts are not enabled in Firebase.";
              break;
          }
        }
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  console.log("##formik", formik)

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <form onSubmit={formik.handleSubmit}>
        <SignInContainer direction="column" justifyContent="space-between">
          <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
            <Grid size={{ xs: 6, md: 6 }}>
              <Card variant="outlined">
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                  Sign Up
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: 2,
                  }}
                >
                  <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      fullWidth
                      variant="outlined"
                      color={formik.touched.email && Boolean(formik.errors.email) ? 'error' : 'primary'}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                      id="password"
                      name="password"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      placeholder="••••••"
                      variant="outlined"
                      fullWidth
                      color={formik.touched.password && Boolean(formik.errors.password) ? 'error' : 'primary'}
                    />
                  </FormControl>
                  {/* Single-Select for MFA Options */}
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Select Multi-Factor Authentication</FormLabel>
                    <Select
                      id="selectedMFA"
                      name="selectedMFA"
                      value={formik.values.selectedMFA}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {mfaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                  >
                    {formik.isSubmitting ? "Signing Up..." : "Sign Up"}
                  </Button>
                </Box>
                <Divider>or</Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ textAlign: 'center' }}>
                    {'Already have an account ?  '}
                    <Link
                      to="/sign-in"
                      style={{ alignSelf: 'center', color: 'white' }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {formik.values.selectedMFA.trim() && formik.values.selectedMFA !== "email" && (
              <Grid size={{ xs: 6, md: 6 }} justifyContent="center" alignItems="center">
                <Card variant="outlined">
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 450,
                      padding: 3,
                      boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      Add Details
                    </Typography>

                    <Box>
                      {/* Mobile OTP MFA */}
                      {formik.values.selectedMFA === "mobile" && (
                        <FormControl fullWidth margin="normal">
                          <FormLabel>Phone Number</FormLabel>
                          <TextField
                            color={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber) ? 'error' : 'primary'}
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            fullWidth
                            variant="outlined"
                            value={formik.values.phoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                          />
                        </FormControl>
                      )}

                      {/* Security Questions MFA */}
                      {formik.values.selectedMFA === "questions" &&
                        formik.values.securityQuestions.map((q:any, index:number) => {
                          // Prevent duplicate selections
                          const selectedQuestions = formik.values.securityQuestions.map((q:any) => q.question);
                          const availableQuestions = securityQuestions.filter(
                            (question) => !selectedQuestions.includes(question) || question === q.question
                          );

                          return (
                            <Box key={index} sx={{ marginTop: 2 }}>
                              <FormControl fullWidth>
                                <FormLabel>Security Question {index + 1}</FormLabel>
                                <Select
                                  name={`securityQuestions[${index}].question`}
                                  value={q.question}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  displayEmpty
                                >
                                  <MenuItem value="" disabled>Select a question</MenuItem>
                                  {availableQuestions.map((question, idx) => (
                                    <MenuItem key={idx} value={question}>
                                      {question}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              <FormControl fullWidth sx={{ marginTop: 1 }}>
                                <FormLabel>Answer</FormLabel>
                                <TextField
                                  name={`securityQuestions[${index}].answer`}
                                  value={q.answer}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.securityQuestions?.[index]?.answer && Boolean(formik.errors.securityQuestions?.[index]?.answer)}
                                  helperText={formik.touched.securityQuestions?.[index]?.answer && formik.errors.securityQuestions?.[index]?.answer}
                                />
                              </FormControl>
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                </Card>
              </Grid>)
            }
          </Grid>
        </SignInContainer>
      </form>
    </AppTheme>
  );
}
