import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import AppTheme from '../theme/AppTheme';
import { MenuItem, Select, styled, Switch } from '@mui/material';
import { signInWithCredentials, signInWithGoogle } from '../firebase/auth';
import { Link, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import Grid from '@mui/material/Grid2';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { FirebaseError } from "firebase/app";
import { doc, setDoc, getFirestore } from "firebase/firestore";

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
  { label: "None", value: "" },
  // { label: "Email OTP", value: "email" },
  { label: "Mobile OTP", value: "mobile" },
  { label: "TOTP (Authenticator App)", value: "totp" },
  { label: "Security Questions", value: "questions" },
];
const db = getFirestore();

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [selectedMFA, setSelectedMFA] = React.useState<string>("");

  const { session, setSession, loading } = useSession();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [questions, setQuestions] = React.useState([{ question: '', answer: '' }, { question: '', answer: '' }, { question: '', answer: '' }]);
  const [questionError, setQuestionError] = React.useState(false);

  const auth = getAuth();

  const handleMFAChange = (event: any) => {
    setSelectedMFA(event.target.value);
  };

  // Extract selected questions to prevent duplicate selections
  const selectedQuestions = questions.map(q => q.question).filter(q => q !== "");

  const signUpHandler = async () => {
    setIsLoading(true);
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
  
    let isValid = true;
  
    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }
  
    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }
  
    if (!isValid) return;
  
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const user = userCredential.user;
  
      if (user) {
        const authData: any = {
          email: user.email,
          authMethod: selectedMFA, // Store selected MFA method
        };
  
        if (selectedMFA === "mobile") {
          authData.phoneNumber = phoneNumber;
        } else if (selectedMFA === "questions") {
          authData.securityQuestions = questions;
        }
  
        // Store authentication data in Firestore
        await setDoc(doc(db, "users", user.uid), authData);
  
        toast.success("User Registered Successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
  
        navigate("/", { replace: true });
      }
    } catch (error:any) {
      console.error("### Firebase Auth Error:", error);

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
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password accounts are not enabled in Firebase.";
            break;
          default:
            errorMessage = error.message;  // Show raw Firebase message
        }
      } 

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = value;
    setQuestions(updatedQuestions);
  };

  const isMFASelected = React.useMemo(() => {
    return selectedMFA !== ""
  }, [selectedMFA]);

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
                    error={emailError}
                    helperText={emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={emailError ? 'error' : 'primary'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <TextField
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={passwordError ? 'error' : 'primary'}
                  />
                </FormControl>
                {/* Single-Select for MFA Options */}
                <FormControl fullWidth>
                  <FormLabel>Select Multi-Factor Authentication</FormLabel>
                  <Select
                    value={selectedMFA}
                    onChange={handleMFAChange}
                    displayEmpty
                    variant="outlined"
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
                  onClick={() => !isLoading && signUpHandler()}
                >
                  {isLoading ? "Loading..." : "Sign Up"}
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
          {!isMFASelected ? <Grid size={{ xs: 6, md: 6 }} alignItems="center" justifyContent="center">
          </Grid> : <Grid size={{ xs: 6, md: 6 }} alignItems="center" justifyContent="center">
            <Card variant="outlined">
              <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
              >
                Add Details
              </Typography>
              <Box>
                {selectedMFA === "mobile" && (
                  <FormControl fullWidth>
                    <FormLabel htmlFor="phonenumber">PhoneNumber</FormLabel>
                    <TextField
                      name="phonenumber"
                      type="tel"
                      variant="outlined"
                      autoFocus
                      required
                      fullWidth
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    />
                  </FormControl>
                )}
                {selectedMFA === "questions" && (
                  <>
                    {questions.map((q, index) => {
                      // Filter available options dynamically
                      const availableQuestions = securityQuestions.filter(q => !selectedQuestions.includes(q) || q === questions[index].question);

                      return (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
                          <FormControl fullWidth>
                            <FormLabel>Security Question {index + 1}</FormLabel>
                            <Select
                              value={q.question}
                              onChange={(e) => handleQuestionChange(index, e.target.value)}
                              displayEmpty
                              required
                            >
                              <MenuItem value="" disabled>Select a question</MenuItem>
                              {availableQuestions.map((question, idx) => (
                                <MenuItem key={idx} value={question}>{question}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth>
                            <FormLabel>Answer</FormLabel>
                            <TextField
                              variant="outlined"
                              required
                              fullWidth
                              type="text"
                              value={q.answer}
                              onChange={(e) => handleAnswerChange(index, e.target.value)}
                            />
                          </FormControl>
                        </Box>
                      );
                    })}
                    {questionError && (
                      <Typography color="error">Please select and answer at least 2 security questions.</Typography>
                    )}
                  </>
                )}
              </Box>
            </Card>
          </Grid>}
        </Grid>
      </SignInContainer>
    </AppTheme>
  );
}
