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
import { Alert, FormHelperText, IconButton, InputAdornment, MenuItem, Select, Snackbar, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import Grid from '@mui/material/Grid2';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { FirebaseError } from "firebase/app";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import bcrypt from "bcryptjs";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  { label: "TOTP", value: "TOTP" },
  { label: "Security Questions", value: "questions" },
  // { label: "TOTP (Authenticator App)", value: "totp" },
];
const db = getFirestore();

const SecretKeyText = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#303030' : '#f5f5f5', // Dark and light mode background
  color: theme.palette.mode === 'dark' ? '#fff' : '#000', // Dark and light mode text color
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  fontFamily: 'monospace',
  boxShadow: theme.palette.mode === 'dark' ? '0px 4px 8px rgba(255, 255, 255, 0.2)' : '0px 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for both modes
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {

  const auth = getAuth();
  const navigate = useNavigate();
  const { session, setSession, loading } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // State to show snackbar when copied
  const secretKey = '3439480384034'; // Example secret key

  // Function to handle copying the secret key to clipboard
  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(secretKey).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
    }).catch((err) => {
      console.error('Error copying text: ', err);
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

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
      selectedMFA: Yup.string().trim().required('Please select MFA '),
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
            const saltRounds = 10;
            const hashedQuestions = await Promise.all(
              values.securityQuestions.map(async (q: any) => ({
                question: q.question,
                answer: await bcrypt.hash(q.answer, saltRounds),
              }))
            );

            // Save to Firestore
            authData.securityQuestions = hashedQuestions;
          }
          console.log("###authData", authData)

          await setDoc(doc(db, "users", user.uid), authData);
          toast.success("User Registered Successfully!");
          navigate("/sign-in", { replace: true });
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
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');

  const generateTOTP = async (email: string) => {
    try {
      console.log(email);
      const response = await axios.post('http://localhost:5000/api/otp/generate', { email });
      console.log(response);

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error generating TOTP:', error);
    }

  };
  useEffect(() => {
    if (formik.values.selectedMFA === 'TOTP' && formik.values.email) {
      generateTOTP(formik.values.email);
    }
  }, [formik.values.selectedMFA, formik.values.email]);

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
                  Sign <u></u>up
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: 2,
                  }}
                >
                  <FormControl error={formik.touched.email && Boolean(formik.errors.email)}>
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
                  <FormControl
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    fullWidth
                  >
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      placeholder="••••••"
                      variant="outlined"
                      fullWidth
                      color={formik.touched.password && Boolean(formik.errors.password) ? 'error' : 'primary'}
                      slotProps={{
                        input: {
                          endAdornment: (<InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>)
                        },
                      }}
                    />
                  </FormControl>
                  {/* Single-Select for MFA Options */}
                  <FormControl fullWidth margin="normal"
                    error={formik.touched.selectedMFA && Boolean(formik.errors.selectedMFA)}>
                    <FormLabel id="selectedMFA">Select Multi-Factor Authentication</FormLabel>
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
                    {formik.touched.selectedMFA && Boolean(formik.errors.selectedMFA) && <FormHelperText>{formik.errors.selectedMFA}</FormHelperText>}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ textAlign: 'center' }}>
                    {'Already have an account ?  '}
                    <Link
                      to="/sign-in"
                      style={{ alignSelf: 'center' }}
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
                      Details
                    </Typography>

                    <Box>
                      {/* Mobile TOTP MFA */}
                      {formik.values.selectedMFA === 'TOTP' && qrCode && <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'background.paper',
                          padding: 3,
                          borderRadius: 2,
                          boxShadow: 2,
                          maxWidth: 400,
                          margin: 'auto',
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                          Scan this QR Code
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <img src={qrCode} alt="TOTP QR Code" style={{ width: 180, height: 180 }} />
                        </Box>
                        <Typography variant="body1" sx={{ marginBottom: 2, textAlign: 'center' }}>
                          Your secret key:
                        </Typography>
                        <SecretKeyText variant="body2">
                          {secretKey}
                        </SecretKeyText>
                        <Button variant="outlined" sx={{ width: '100%' }} onClick={handleCopySecretKey}>
                          Copy Secret Key
                        </Button>

                        {/* Snackbar for Copy Confirmation */}
                        <Snackbar
                          open={isCopied}
                          autoHideDuration={2000}
                          onClose={() => setIsCopied(false)}
                        >
                          <Alert onClose={() => setIsCopied(false)} severity="success" sx={{ width: '100%' }}>
                            Secret key copied!
                          </Alert>
                        </Snackbar>
                      </Box>}


                      {/* Security Questions MFA */}
                      {formik.values.selectedMFA === "questions" &&
                        formik.values.securityQuestions.map((q: any, index: number) => {
                          // Prevent duplicate selections
                          const selectedQuestions = formik.values.securityQuestions.map((q: any) => q.question);
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
